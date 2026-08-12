package com.eventsphere.dto;

import java.util.List;

public record AnalyticsDashboardDTO(
    long   totalEvents,
    long   totalCapacity,
    long   totalRegistrations,
    long   totalCheckIns,
    double overallAttendanceRate,
    long   activeEventsCount,
    long   completedEventsCount,
    List<EventStat> eventBreakdown,
    List<OrganizerStat> organizers,
    List<AttendeeStat> attendees
) {
    /** Per-event statistics row for the dashboard table. */
    public record EventStat(
        Long   id,
        String title,
        String date,
        long   capacity,
        long   registered,
        long   checkedIn,
        double fillRate,       // registered / capacity %
        String eventCode       // invite code — visible to admin
    ) {}

    /** Organizer details and the events they are conducting. */
    public record OrganizerStat(
        Long   id,
        String name,
        String email,
        List<String> eventTitles
    ) {}

    /** Attendee details and the events they registered/checked into. */
    public record AttendeeStat(
        Long   id,
        String name,
        String email,
        List<AttendeeEventStat> registeredEvents
    ) {}

    public record AttendeeEventStat(
        Long   eventId,
        String title,
        String status
    ) {}
}
