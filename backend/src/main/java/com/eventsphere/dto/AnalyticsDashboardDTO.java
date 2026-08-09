package com.eventsphere.dto;

import java.util.List;

public record AnalyticsDashboardDTO(
    long   totalEvents,
    long   totalCapacity,
    long   totalRegistrations,
    long   totalCheckIns,
    double overallAttendanceRate,
    List<EventStat> eventBreakdown
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
}
