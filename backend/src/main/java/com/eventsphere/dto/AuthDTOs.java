package com.eventsphere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Auth-related request and response DTOs.
 */
public class AuthDTOs {

    // ── Request DTOs ──────────────────────────────────────────────────────────

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 100) String password,
        /**
         * Role name to assign. Must be one of: ROLE_ADMIN, ROLE_ORGANIZER, ROLE_ATTENDEE.
         * Defaults to ROLE_ATTENDEE if null.
         */
        String role,

        /** Date of birth in ISO format (yyyy-MM-dd). Required for attendee/organizer. */
        String dob,

        /** 10-digit phone number (without country code prefix). */
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits.")
        String phoneNumber,

        /** City of residence. */
        @Size(max = 100)
        String city
    ) {}

    // ── Response DTOs ─────────────────────────────────────────────────────────

    public record AuthResponse(
        String accessToken,
        String tokenType,
        Long   userId,
        String name,
        String email,
        String role
    ) {
        public AuthResponse(String token, Long userId, String name, String email, String role) {
            this(token, "Bearer", userId, name, email, role);
        }
    }

    public record UserResponse(
        Long   id,
        String name,
        String email,
        String role,
        String dob,
        String phoneNumber,
        String city
    ) {}
}
