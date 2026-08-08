package com.eventsphere.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private Registration registration;

    @Column(name = "qr_token", nullable = false, columnDefinition = "TEXT")
    private String qrToken;

    @Column(name = "issued_at", updatable = false)
    private LocalDateTime issuedAt;

    @PrePersist
    protected void onCreate() {
        this.issuedAt = LocalDateTime.now();
    }
}
