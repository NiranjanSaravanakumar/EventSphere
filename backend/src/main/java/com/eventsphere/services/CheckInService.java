package com.eventsphere.services;

import com.eventsphere.dto.CheckInDTOs.*;
import com.eventsphere.entities.Registration;
import com.eventsphere.entities.Ticket;
import com.eventsphere.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckInService {

    @Autowired
    private TicketRepository ticketRepository;

    /**
     * Validates a scanned QR token and marks the attendee as checked in.
     * Throws if the token is invalid or the ticket has already been used.
     */
    @Transactional
    public CheckInResponse validateAndCheckIn(String qrToken) {
        // Locate ticket by QR token
        Ticket ticket = ticketRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid ticket — QR token not recognised."));

        Registration registration = ticket.getRegistration();

        // Prevent double check-in
        if (registration.getStatus() == Registration.Status.CHECKED_IN) {
            throw new IllegalStateException(
                "Ticket already used. " + registration.getAttendee().getName() +
                " was checked in earlier.");
        }

        // Prevent cancelled tickets from being used
        if (registration.getStatus() == Registration.Status.CANCELLED) {
            throw new IllegalStateException("This registration has been cancelled.");
        }

        // Mark as checked in
        registration.setStatus(Registration.Status.CHECKED_IN);

        return new CheckInResponse(
            true,
            "Check-in successful.",
            registration.getAttendee().getName(),
            registration.getEvent().getTitle()
        );
    }
}
