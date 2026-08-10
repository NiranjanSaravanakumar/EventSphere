package com.eventsphere.services;

import com.eventsphere.repositories.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Security expression-language bean used in @PreAuthorize expressions.
 *
 * Registered as "eventSecurity" so controllers can reference it as:
 *   @PreAuthorize("hasRole('ADMIN') or @eventSecurity.isOwner(#id, authentication.name)")
 *
 * Returning false (not throwing) keeps Spring Security in control of the 403 response.
 */
@Service("eventSecurity")
public class EventSecurityService {

    @Autowired
    private EventRepository eventRepository;

    /**
     * Returns true if the event identified by {@code eventId} was created by
     * the user identified by {@code requesterEmail}.
     *
     * <p>Returns {@code false} (never throws) when the event does not exist so
     * that Spring Security can emit a consistent 403 rather than a 404.
     *
     * @param eventId        the event's primary key from the URL path variable
     * @param requesterEmail the email address extracted from the verified JWT token
     */
    @Transactional(readOnly = true)
    public boolean isOwner(Long eventId, String requesterEmail) {
        return eventRepository.findById(eventId)
                .map(event -> event.getOrganizer().getEmail().equalsIgnoreCase(requesterEmail))
                .orElse(false);
    }
}
