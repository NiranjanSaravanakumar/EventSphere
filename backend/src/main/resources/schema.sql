CREATE DATABASE IF NOT EXISTS eventsphere;
USE eventsphere;

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO roles (id, name) VALUES
    (1, 'ROLE_ADMIN'),
    (2, 'ROLE_ORGANIZER'),
    (3, 'ROLE_ATTENDEE');

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. User–Roles join table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Events
CREATE TABLE IF NOT EXISTS events (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    date         DATETIME     NOT NULL,
    location     VARCHAR(255) NOT NULL,
    capacity     INT          NOT NULL,
    organizer_id BIGINT       NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_organizer (organizer_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Registrations
CREATE TABLE IF NOT EXISTS registrations (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id    BIGINT NOT NULL,
    attendee_id BIGINT NOT NULL,
    status      ENUM('REGISTERED','CHECKED_IN','CANCELLED') DEFAULT 'REGISTERED',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event_attendee (event_id, attendee_id),
    FOREIGN KEY (event_id)    REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (attendee_id) REFERENCES users  (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tickets (QR Engine)
CREATE TABLE IF NOT EXISTS tickets (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT NOT NULL UNIQUE,
    qr_token        TEXT   NOT NULL,
    issued_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
