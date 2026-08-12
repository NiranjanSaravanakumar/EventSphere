package com.eventsphere.repositories;

import com.eventsphere.entities.Event;
import com.eventsphere.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerAndIsDeletedFalse(User organizer);
    List<Event> findByDateAfterAndIsDeletedFalseOrderByDateAsc(LocalDateTime now);
}
