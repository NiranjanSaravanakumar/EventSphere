package com.eventsphere.controllers;

import com.eventsphere.services.RegistrationService;
import com.eventsphere.services.RegistrationService.TicketView;
import com.eventsphere.services.RegistrationService.GuestView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    /** Simple body record for the event-code payload. */
    record RegisterRequest(String eventCode) {}

    /**
     * POST /api/registrations/event/{eventId}
     * Body: { "eventCode": "XXXXXX" }
     * Authenticated — register the current user for an event (code-gated).
     */
    @PostMapping("/event/{eventId}")
    public ResponseEntity<?> register(
            @PathVariable Long eventId,
            @RequestBody RegisterRequest body,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            registrationService.registerAttendee(eventId, userDetails.getUsername(), body.eventCode());
            return ResponseEntity.ok(Map.of("message", "Successfully registered for the event."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/registrations/my-tickets  (legacy alias — kept for backwards compatibility)
     * Prefer GET /api/attendees/me/tickets (served by AttendeeController).
     */
    @GetMapping("/my-tickets")
    public ResponseEntity<List<TicketView>> myTicketsAlias(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(registrationService.getMyTickets(userDetails.getUsername()));
    }

    /**
     * DELETE /api/registrations/{id}
     * Attendee — cancel their own registration (frees up capacity slot).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            registrationService.cancelRegistration(id, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Registration cancelled successfully."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/registrations/event/{eventId}/guests
     * Organizer/Admin — view the full guest list for an event.
     */
    @GetMapping("/event/{eventId}/guests")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<GuestView>> guestList(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                registrationService.getGuestList(eventId, userDetails.getUsername()));
    }
}
