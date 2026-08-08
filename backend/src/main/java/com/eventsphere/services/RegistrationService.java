package com.eventsphere.services;

import com.eventsphere.entities.*;
import com.eventsphere.repositories.*;
import com.eventsphere.services.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RegistrationService {

    @Autowired private RegistrationRepository registrationRepository;
    @Autowired private TicketRepository        ticketRepository;
    @Autowired private EventRepository         eventRepository;
    @Autowired private UserRepository          userRepository;
    @Autowired private QRCodeService           qrCodeService;

    /**
     * Register an attendee for an event with capacity and duplicate checks.
     */
    @Transactional
    public Registration registerAttendee(Long eventId, String attendeeEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));

        User attendee = userRepository.findByEmail(attendeeEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + attendeeEmail));

        // Duplicate registration check
        if (registrationRepository.existsByEventAndAttendee(event, attendee)) {
            throw new IllegalStateException("You are already registered for this event.");
        }

        // Capacity check
        long currentCount = registrationRepository.countByEvent(event);
        if (currentCount >= event.getCapacity()) {
            throw new IllegalStateException("This event is fully booked.");
        }

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

        // Ownership check — unless admin
        boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getAuthorities()
                .contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"));

        if (!isAdmin && !event.getOrganizer().getEmail().equals(requesterEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not the organizer of this event.");
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
