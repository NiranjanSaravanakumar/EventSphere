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
     * Aggregates and calculates analytics metrics for the dashboard.
     * The metrics are scoped depending on the role of the requesting user:
     * - Admins receive global metrics across all events and users.
     * - Organizers receive metrics scoped strictly to the events they own.
     *
     * @param email The email address of the requesting user.
     * @param isAdmin True if the user has the ADMIN role, granting global visibility.
     * @return AnalyticsDashboardDTO containing aggregated metrics, event breakdown, and user stats.
     */
    @Transactional(readOnly = true)
    public AnalyticsDashboardDTO getMetrics(String email, boolean isAdmin) {
        List<Event> events = isAdmin
                ? eventRepository.findAll() // Admin sees all events, including deleted, or maybe we want to filter here too, but findAll is fine for compile
                : eventRepository.findByOrganizerAndIsDeletedFalse(findUser(email));

        long totalCapacity      = 0;
        long totalRegistrations = 0;
        long totalCheckIns      = 0;
        long activeEventsCount  = 0;
        long completedEventsCount = 0;

        var breakdown = new java.util.ArrayList<EventStat>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        for (Event event : events) {
            // Only count active (non-cancelled) seats so cancellations lower totals
            long registered = registrationRepository
                                  .countByEventAndStatusNot(event, Registration.Status.CANCELLED);
            long checkedIn  = registrationRepository.countByEventAndStatus(
                                  event, Registration.Status.CHECKED_IN);
            long cap        = event.getCapacity();
            double fillRate = cap > 0 ? (registered * 100.0 / cap) : 0.0;

            totalCapacity      += cap;
            totalRegistrations += registered;
            totalCheckIns      += checkedIn;
            
            if (event.getDate() != null && event.getDate().isAfter(now)) {
                activeEventsCount++;
            } else {
                completedEventsCount++;
            }

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

        java.util.List<AnalyticsDashboardDTO.OrganizerStat> organizers = new java.util.ArrayList<>();
        java.util.List<AnalyticsDashboardDTO.AttendeeStat> attendees = new java.util.ArrayList<>();

        if (isAdmin) {
            java.util.List<User> allUsers = userRepository.findAll();
            java.util.List<Registration> allRegs = registrationRepository.findAll();
            
            for (User u : allUsers) {
                boolean isOrganizer = u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ORGANIZER"));
                boolean isAttendee = u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ATTENDEE"));
                
                if (isOrganizer) {
                    java.util.List<String> orgEvents = events.stream()
                        .filter(e -> e.getOrganizer().getId().equals(u.getId()))
                        .map(Event::getTitle)
                        .toList();
                    organizers.add(new AnalyticsDashboardDTO.OrganizerStat(u.getId(), u.getName(), u.getEmail(), orgEvents));
                }
                
                if (isAttendee) {
                    java.util.List<AnalyticsDashboardDTO.AttendeeEventStat> attEvents = allRegs.stream()
                        .filter(r -> r.getAttendee().getId().equals(u.getId()))
                        .map(r -> new AnalyticsDashboardDTO.AttendeeEventStat(r.getEvent().getId(), r.getEvent().getTitle(), r.getStatus().name()))
                        .toList();
                    attendees.add(new AnalyticsDashboardDTO.AttendeeStat(u.getId(), u.getName(), u.getEmail(), attEvents));
                }
            }
        }

        return new AnalyticsDashboardDTO(
            events.size(),
            totalCapacity,
            totalRegistrations,
            totalCheckIns,
            attendanceRate,
            activeEventsCount,
            completedEventsCount,
            breakdown,
            organizers,
            attendees
        );
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }
}
