package com.eventsphere.dto;

/**
 * Check-in request/response DTOs.
 */
public class CheckInDTOs {

    public record CheckInRequest(String qrToken) {}

    public record CheckInResponse(
        boolean success,
        String  message,
        String  attendeeName,
        String  eventTitle
    ) {}
}
