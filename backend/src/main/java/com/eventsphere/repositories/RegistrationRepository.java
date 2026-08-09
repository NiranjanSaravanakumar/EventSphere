package com.eventsphere.repositories;

import com.eventsphere.entities.Registration;
import com.eventsphere.entities.Event;
import com.eventsphere.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByAttendee(User attendee);
    List<Registration> findByEvent(Event event);
    Optional<Registration> findByEventAndAttendee(Event event, User attendee);
    boolean existsByEventAndAttendee(Event event, User attendee);
    long countByEvent(Event event);
    long countByEventAndStatus(Event event, Registration.Status status);
    /** Count only non-cancelled registrations — used for accurate capacity checks. */
    long countByEventAndStatusNot(Event event, Registration.Status status);
}
