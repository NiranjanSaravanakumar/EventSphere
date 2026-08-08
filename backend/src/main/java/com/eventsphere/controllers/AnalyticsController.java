package com.eventsphere.controllers;

import com.eventsphere.dto.AnalyticsDashboardDTO;
import com.eventsphere.services.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET /api/analytics/dashboard
     * Organizers see their own events; Admins see all events.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<AnalyticsDashboardDTO> getDashboard(Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        AnalyticsDashboardDTO metrics =
                analyticsService.getMetrics(authentication.getName(), isAdmin);

        return ResponseEntity.ok(metrics);
    }
}
