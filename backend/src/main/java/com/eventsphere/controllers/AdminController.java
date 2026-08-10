package com.eventsphere.controllers;

import com.eventsphere.dto.AnalyticsDashboardDTO;
import com.eventsphere.dto.EventDTOs.EventResponse;
import com.eventsphere.entities.Role;
import com.eventsphere.entities.User;
import com.eventsphere.repositories.UserRepository;
import com.eventsphere.services.AnalyticsService;
import com.eventsphere.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoints.
 * All routes under /api/admin/** require ROLE_ADMIN (enforced in SecurityConfig + @PreAuthorize).
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private UserRepository  userRepository;
    @Autowired private EventService    eventService;
    @Autowired private AnalyticsService analyticsService;

    /**
     * GET /api/admin/users
     * Returns the complete list of all registered users (Organizers + Attendees).
     */
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id",        u.getId(),
                        "name",      u.getName(),
                        "email",     u.getEmail(),
                        "role",      u.getRoles().stream().map(Role::getName).findFirst().orElse("UNKNOWN"),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                ))
                .toList();
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/admin/events
     * Returns every event on the platform regardless of organizer.
     */
    @GetMapping("/events")
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    /**
     * GET /api/admin/analytics
     * Returns global platform metrics — all events, all registrations.
     */
    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsDashboardDTO> getAnalytics(Authentication authentication) {
        return ResponseEntity.ok(
                analyticsService.getMetrics(authentication.getName(), true));
    }
}
