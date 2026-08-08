package com.eventsphere.repositories;

import com.eventsphere.entities.Ticket;
import com.eventsphere.entities.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByRegistration(Registration registration);
    Optional<Ticket> findByQrToken(String qrToken);
}
