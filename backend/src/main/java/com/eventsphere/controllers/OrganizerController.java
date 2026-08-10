package com.eventsphere.controllers;

import com.eventsphere.dto.AnalyticsDashboardDTO;
import com.eventsphere.dto.EventDTOs.EventResponse;
import com.eventsphere.services.AnalyticsService;
import com.eventsphere.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Organizer-scoped endpoints under /api/organizers/me/**.
 *
 * Security: identity is derived exclusively from the verified JWT token —
 * no username appears in any URL parameter.
 */
@RestController
@RequestMapping("/api/organizers/me")
@PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
public class OrganizerController {

    @Autowired private EventService     eventService;
    @Autowired private AnalyticsService analyticsService;

    /**
     * GET /api/organizers/me/events
     * Returns only the events owned by the JWT token holder.
     * Replaces the old GET /api/events/organizer endpoint.
     */
    @GetMapping("/events")
    public ResponseEntity<List<EventResponse>> myEvents(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                eventService.getEventsByOrganizerEmail(userDetails.getUsername()));
    }

    /**
     * GET /api/organizers/me/dashboard
     * Returns analytics metrics scoped to this organizer's own events.
     * Replaces the old GET /api/analytics/dashboard (organizer-scoped view).
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDashboardDTO> myDashboard(Authentication authentication) {
        AnalyticsDashboardDTO metrics =
                analyticsService.getMetrics(authentication.getName(), false);
        return ResponseEntity.ok(metrics);
    }
}
