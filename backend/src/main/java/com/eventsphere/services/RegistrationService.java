package com.eventsphere.services;

import com.eventsphere.entities.*;
import com.eventsphere.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RegistrationService {

    @Autowired private RegistrationRepository registrationRepository;
    @Autowired private TicketRepository        ticketRepository;
    @Autowired private EventRepository         eventRepository;
    @Autowired private UserRepository          userRepository;
    @Autowired private QRCodeService           qrCodeService;

    /**
     * Register an attendee for an event, enforcing three sequential gates:
     *  1. Event code must match.
     *  2. Current time must fall within the registration window.
     *  3. Active (non-cancelled) seat count must be below capacity.
     *  4. No duplicate registrations.
     */
    @Transactional
    public Registration registerAttendee(Long eventId, String attendeeEmail, String providedEventCode) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));

        User attendee = userRepository.findByEmail(attendeeEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + attendeeEmail));

        // ── Gate 1: Event Code ───────────────────────────────────────────────
        if (!event.getEventCode().equalsIgnoreCase(providedEventCode)) {
            throw new IllegalStateException("Invalid event code. Please check with the organizer.");
        }

        // ── Gate 2: Registration Time Window ─────────────────────────────────
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getRegistrationStart()) || now.isAfter(event.getRegistrationEnd())) {
            throw new IllegalStateException("Registration is not currently open for this event.");
        }

        // ── Gate 3: Capacity (only count active + checked-in, ignore cancelled) ──
        long activeSeatsTaken = registrationRepository
                .countByEventAndStatusNot(event, Registration.Status.CANCELLED);
        if (activeSeatsTaken >= event.getCapacity()) {
            throw new IllegalStateException("This event is fully booked.");
        }

        // ── Gate 4: Duplicate registration check ──────────────────────────────
        if (registrationRepository.existsByEventAndAttendee(event, attendee)) {
            throw new IllegalStateException("You are already registered for this event.");
        }

        // ── All gates passed — create registration ───────────────────────────
        Registration registration = Registration.builder()
                .event(event)
                .attendee(attendee)
                .status(Registration.Status.REGISTERED)
                .build();

        registrationRepository.save(registration);

        // Generate QR ticket immediately after registration
        String qrToken = qrCodeService.generateToken(registration);
        Ticket ticket = Ticket.builder()
                .registration(registration)
                .qrToken(qrToken)
                .build();
        ticketRepository.save(ticket);

        return registration;
    }

    /**
     * Fetch all tickets (with QR tokens) for the logged-in attendee.
     */
    @Transactional(readOnly = true)
    public List<TicketView> getMyTickets(String attendeeEmail) {
        User attendee = userRepository.findByEmail(attendeeEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + attendeeEmail));

        return registrationRepository.findByAttendee(attendee)
                .stream()
                .filter(r -> r.getStatus() != Registration.Status.CANCELLED)
                .map(r -> {
                    Ticket ticket = ticketRepository.findByRegistration(r).orElse(null);
                    String qrToken  = ticket != null ? ticket.getQrToken() : null;
                    String qrBase64 = qrToken != null ? qrCodeService.generateQRCodeBase64(qrToken) : null;
                    return new TicketView(
                            r.getId(),
                            r.getEvent().getId(),
                            r.getEvent().getTitle(),
                            r.getEvent().getDate(),
                            r.getEvent().getLocation(),
                            r.getStatus().name(),
                            qrToken,
                            qrBase64
                    );
                })
                .toList();
    }

    /**
     * Attendee cancels their own registration, freeing capacity.
     * Setting status to CANCELLED means countByEventAndStatusNot will exclude this seat.
     */
    @Transactional
    public void cancelRegistration(Long registrationId, String attendeeEmail) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found: " + registrationId));

        if (!registration.getAttendee().getEmail().equals(attendeeEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("You can only cancel your own registrations.");
        }

        if (registration.getStatus() == Registration.Status.CHECKED_IN) {
            throw new IllegalStateException("Cannot cancel a registration that has already been checked in.");
        }

        if (registration.getStatus() == Registration.Status.CANCELLED) {
            throw new IllegalStateException("This registration is already cancelled.");
        }

        registration.setStatus(Registration.Status.CANCELLED);
    }

    /**
     * Organizer sees the full guest list for one of their events.
     * Admin can see the guest list for any event.
     */
    @Transactional(readOnly = true)
    public List<GuestView> getGuestList(Long eventId, String requesterEmail) {
        com.eventsphere.entities.Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));

        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities()
                .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

        if (!isAdmin && !event.getOrganizer().getEmail().equals(requesterEmail)) {
            throw new AccessDeniedException("You are not the organizer of this event.");
        }

        return registrationRepository.findByEvent(event)
                .stream()
                .map(r -> new GuestView(
                        r.getId(),
                        r.getAttendee().getId(),
                        r.getAttendee().getName(),
                        r.getAttendee().getEmail(),
                        r.getStatus().name(),
                        r.getRegisteredAt()
                ))
                .toList();
    }

    // ── Guest view DTO ────────────────────────────────────────────────────────
    public record GuestView(
        Long   registrationId,
        Long   attendeeId,
        String attendeeName,
        String attendeeEmail,
        String status,
        java.time.LocalDateTime registeredAt
    ) {}

    // ── Ticket view DTO ───────────────────────────────────────────────────────
    public record TicketView(
        Long          registrationId,
        Long          eventId,
        String        eventTitle,
        java.time.LocalDateTime eventDate,
        String        eventLocation,
        String        status,
        String        qrToken,
        String        qrBase64   // data:image/png;base64,... ready for <img src=""/>
    ) {}
}
