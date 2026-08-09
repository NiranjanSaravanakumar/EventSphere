package com.eventsphere.services;

import com.eventsphere.dto.EventDTOs.*;
import com.eventsphere.entities.Event;
import com.eventsphere.entities.Registration;
import com.eventsphere.entities.User;
import com.eventsphere.repositories.EventRepository;
import com.eventsphere.repositories.RegistrationRepository;
import com.eventsphere.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    @Autowired private EventRepository       eventRepository;
    @Autowired private UserRepository        userRepository;
    @Autowired private RegistrationRepository registrationRepository;

    // ── Public: all upcoming events ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<EventResponse> getAllFutureEvents() {
        return eventRepository
                .findByDateAfterOrderByDateAsc(LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Organizer: events by logged-in user ───────────────────────────────────
    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByOrganizerEmail(String email) {
        User organizer = findUser(email);
        return eventRepository.findByOrganizer(organizer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Get single event ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public EventResponse getById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
        return toResponse(event);
    }

    // ── Create event ──────────────────────────────────────────────────────────
    @Transactional
    public EventResponse createEvent(EventRequest request, String organizerEmail) {
        User organizer = findUser(organizerEmail);

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .date(request.date())
                .location(request.location())
                .capacity(request.capacity())
                .organizer(organizer)
                // eventCode — use provided value or let @PrePersist auto-generate
                .eventCode(request.eventCode())
                .registrationStart(request.registrationStart())
                .registrationEnd(request.registrationEnd())
                .build();

        return toResponse(eventRepository.save(event));
    }

    // ── Update event ──────────────────────────────────────────────────────────
    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request, String requesterEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));

        // Admins bypass ownership check — they can update any event
        if (!isAdmin() && !event.getOrganizer().getEmail().equals(requesterEmail)) {
            throw new AccessDeniedException("You are not the organizer of this event.");
        }

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setDate(request.date());
        event.setLocation(request.location());
        event.setCapacity(request.capacity());
        event.setRegistrationStart(request.registrationStart());
        event.setRegistrationEnd(request.registrationEnd());
        // Allow manual override of the code; keep existing code if not supplied
        if (request.eventCode() != null && !request.eventCode().isBlank()) {
            event.setEventCode(request.eventCode().toUpperCase());
        }

        return toResponse(eventRepository.save(event));
    }

    // ── Delete event ──────────────────────────────────────────────────────────
    @Transactional
    public void deleteEvent(Long id, String requesterEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));

        // Admins bypass ownership check — they can delete any event
        if (!isAdmin() && !event.getOrganizer().getEmail().equals(requesterEmail)) {
            throw new AccessDeniedException("You are not the organizer of this event.");
        }

        eventRepository.delete(event);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────
    private EventResponse toResponse(Event e) {
        long registered    = registrationRepository.countByEvent(e);
        long activeSeatsTaken = registrationRepository
                .countByEventAndStatusNot(e, Registration.Status.CANCELLED);
        long availableSeats = Math.max(0, e.getCapacity() - activeSeatsTaken);
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getDate(),
                e.getLocation(),
                e.getCapacity(),
                e.getOrganizer().getId(),
                e.getOrganizer().getName(),
                registered,
                e.getCreatedAt(),
                e.getEventCode(),
                e.getRegistrationStart(),
                e.getRegistrationEnd(),
                availableSeats
        );
    }

    // ── Get ALL events (Admin only) ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream().map(this::toResponse).toList();
    }

    // ── Helper: is current caller an Admin? ────────────────────────────────────
    private boolean isAdmin() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }
}
