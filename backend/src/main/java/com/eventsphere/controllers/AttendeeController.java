package com.eventsphere.controllers;

import com.eventsphere.services.RegistrationService;
import com.eventsphere.services.RegistrationService.TicketView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Attendee-scoped endpoints under /api/attendees/me/**.
 * Identity is always derived from the verified JWT token — never from the URL.
 */
@RestController
@RequestMapping("/api/attendees/me")
public class AttendeeController {

    @Autowired
    private RegistrationService registrationService;

    /**
     * GET /api/attendees/me/tickets
     * Returns the logged-in attendee's active registrations with Base64 QR codes.
     */
    @GetMapping("/tickets")
    public ResponseEntity<List<TicketView>> myTickets(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                registrationService.getMyTickets(userDetails.getUsername()));
    }
}
