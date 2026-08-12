package com.eventsphere.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/**
 * Event-related request and response DTOs.
 */
public class EventDTOs {

    public record EventRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime date,
        @NotBlank @Size(max = 255) String location,
        @NotNull @Min(1) Integer capacity,
        /** Optional — if null the backend auto-generates a 6-char alphanumeric code. */
        String eventCode,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime registrationStart,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime registrationEnd
    ) {}

    public record EventResponse(
        Long          id,
        String        title,
        String        description,
        LocalDateTime date,
        String        location,
        Integer       capacity,
        Long          organizerId,
        String        organizerName,
        long          registeredCount,
        LocalDateTime createdAt,
        /** Unique invite code — visible to Organizer & Admin; hidden from Attendee UI. */
        String        eventCode,
        LocalDateTime registrationStart,
        LocalDateTime registrationEnd,
        /** capacity − active (non-cancelled) registrations. */
        long          availableSeats,
        boolean       isDeleted
    ) {}
}
