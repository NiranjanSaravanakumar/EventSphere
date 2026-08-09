package com.eventsphere.services;

import com.eventsphere.dto.AnalyticsDashboardDTO;
import com.eventsphere.dto.AnalyticsDashboardDTO.EventStat;
import com.eventsphere.entities.Event;
import com.eventsphere.entities.Registration;
import com.eventsphere.entities.User;
import com.eventsphere.repositories.EventRepository;
import com.eventsphere.repositories.RegistrationRepository;
import com.eventsphere.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AnalyticsService {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMM d, yyyy");

    @Autowired private EventRepository        eventRepository;
    @Autowired private RegistrationRepository registrationRepository;
    @Autowired private UserRepository         userRepository;

    /**
     * Aggregates metrics scoped to the requesting organizer,
     * or globally for admins.
     */
    @Transactional(readOnly = true)
    public AnalyticsDashboardDTO getMetrics(String email, boolean isAdmin) {
        List<Event> events = isAdmin
                ? eventRepository.findAll()
                : eventRepository.findByOrganizer(findUser(email));

        long totalCapacity      = 0;
        long totalRegistrations = 0;
        long totalCheckIns      = 0;

        var breakdown = new java.util.ArrayList<EventStat>();

        for (Event event : events) {
            long registered = registrationRepository.countByEvent(event);
            long checkedIn  = registrationRepository.countByEventAndStatus(
                                  event, Registration.Status.CHECKED_IN);
            long cap        = event.getCapacity();
            double fillRate = cap > 0 ? (registered * 100.0 / cap) : 0.0;

            totalCapacity      += cap;
            totalRegistrations += registered;
            totalCheckIns      += checkedIn;

            breakdown.add(new EventStat(
                event.getId(),
                event.getTitle(),
                event.getDate() != null ? event.getDate().format(DATE_FMT) : "—",
                cap,
                registered,
                checkedIn,
                Math.round(fillRate * 10.0) / 10.0,
                event.getEventCode()
            ));
        }

        // Sort by fill rate descending — most popular events first
        breakdown.sort((a, b) -> Double.compare(b.fillRate(), a.fillRate()));

        double attendanceRate = totalRegistrations > 0
                ? Math.round((totalCheckIns * 100.0 / totalRegistrations) * 10.0) / 10.0
                : 0.0;

        return new AnalyticsDashboardDTO(
            events.size(),
            totalCapacity,
            totalRegistrations,
            totalCheckIns,
            attendanceRate,
            breakdown
        );
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }
}
