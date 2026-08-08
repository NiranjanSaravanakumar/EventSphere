package com.eventsphere.controllers;

import com.eventsphere.dto.EventDTOs.*;
import com.eventsphere.services.EventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    /**
     * GET /api/events
     * Public — list all upcoming events.
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllUpcoming() {
        return ResponseEntity.ok(eventService.getAllFutureEvents());
    }

    /**
     * GET /api/events/{id}
     * Public — get a single event by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getById(id));
    }

    /**
     * GET /api/events/organizer
     * Organizer/Admin — list events created by the current user.
     */
    @GetMapping("/organizer")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<EventResponse>> getMyEvents(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(eventService.getEventsByOrganizerEmail(userDetails.getUsername()));
    }

    /**
     * POST /api/events
     * Organizer/Admin — create a new event.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventResponse> create(
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(eventService.createEvent(request, userDetails.getUsername()));
    }

    /**
     * PUT /api/events/{id}
     * Organizer/Admin — update an existing event.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(eventService.updateEvent(id, request, userDetails.getUsername()));
    }

    /**
     * DELETE /api/events/{id}
     * Organizer/Admin — delete an event.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        eventService.deleteEvent(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
