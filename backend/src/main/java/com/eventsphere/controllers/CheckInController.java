package com.eventsphere.controllers;

import com.eventsphere.dto.CheckInDTOs.*;
import com.eventsphere.services.CheckInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/check-in")
public class CheckInController {

    @Autowired
    private CheckInService checkInService;

    /**
     * POST /api/check-in
     * Organizer/Admin — validate a scanned QR token and mark attendance.
     *
     * Body: { "qrToken": "ES-42-A3F9..." }
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<CheckInResponse> checkIn(@RequestBody CheckInRequest request) {
        try {
            CheckInResponse response = checkInService.validateAndCheckIn(request.qrToken());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // Already checked in / cancelled
            return ResponseEntity.badRequest().body(
                new CheckInResponse(false, e.getMessage(), null, null)
            );
        } catch (IllegalArgumentException e) {
            // Token not found
            return ResponseEntity.badRequest().body(
                new CheckInResponse(false, e.getMessage(), null, null)
            );
        }
    }
}
