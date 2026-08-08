# EventSphere — Backend

Spring Boot 3 REST API powering the EventSphere platform.

---

## Tech Stack

| | |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.x |
| Security | Spring Security 6 + JJWT 0.12 |
| ORM | Spring Data JPA (Hibernate 6) |
| Database | MySQL 8.0 |
| QR Codes | Google ZXing 3.5.3 |
| Utilities | Lombok |
| Build | Maven 3.8+ (bundled via `mvnw` wrapper) |

---

## Prerequisites

- **Java 17+** — [Download Temurin](https://adoptium.net/)
- **MySQL 8.0** running locally on port `3306`
- No Maven install needed — the `mvnw` wrapper is included

---

## Database Setup

```sql
-- Run once in MySQL shell or Workbench
CREATE DATABASE eventsphere;
```

Tables are created **automatically** on first startup via `schema.sql`
(`spring.sql.init.mode=always`).

The `DataSeeder.java` component seeds a default Admin account on first boot:

| Field | Value |
|---|---|
| Email | `admin@eventsphere.com` |
| Password | `admin123` |
| Role | `ROLE_ADMIN` |

---

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# ── Database ───────────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/eventsphere
spring.datasource.username=root
spring.datasource.password=root

# ── JPA ────────────────────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=validate
spring.sql.init.mode=always

# ── JWT ────────────────────────────────────────────────────────────
# Change this to a long random string in production!
app.jwt.secret=eventsphere-super-secret-key-change-me-in-production
app.jwt.expiration-ms=86400000

# ── Server ─────────────────────────────────────────────────────────
server.port=8080
```

> **Production:** Inject `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
> `SPRING_DATASOURCE_PASSWORD`, and `APP_JWT_SECRET` as environment variables —
> never commit secrets.

---

## Running Locally

```powershell
# Windows (from the /backend directory)
.\mvnw.cmd spring-boot:run
```

```bash
# Linux / macOS
./mvnw spring-boot:run
```

API is available at **http://localhost:8080**

---

## Stopping the Server / Managing Processes

If you see **"Port 8080 already in use"**, an old Java process is still running. Kill it first:

```powershell
# Option 1 — Kill by port (recommended)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess -Force

# Option 2 — Kill all Java processes
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# Option 3 — Find PID manually, then kill it
netstat -ano | findstr ":8080"
Stop-Process -Id <PID> -Force
```

```bash
# Linux / macOS
kill -9 $(lsof -t -i:8080)
```

In VS Code terminal: press **Ctrl + C** to stop the running process, then click the **🗑️ trash icon** on the terminal tab to close it.

---

## Building a JAR

```bash
./mvnw clean package -DskipTests
java -jar target/eventsphere-*.jar
```

---

## Docker

```bash
# Build image (from /backend)
docker build -t eventsphere-api .

# Run
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/eventsphere \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root \
  -e APP_JWT_SECRET=change-me \
  eventsphere-api
```

Multi-stage build:
- **Stage 1 (build):** `eclipse-temurin:17-jdk-alpine` — compiles and packages
- **Stage 2 (run):** `eclipse-temurin:17-jre-alpine` — lean ~130 MB image, non-root user

---

## Package Structure

```
com.eventsphere/
│
├── config/
│   ├── DataSeeder.java          # Seeds default Admin account on first boot
│   ├── SecurityConfig.java      # Stateless JWT filter chain, CORS, RBAC rules
│   └── WebConfig.java           # CORS configuration bean
│
├── controllers/
│   ├── AdminController.java         # /api/admin/**  (ROLE_ADMIN only)
│   ├── AnalyticsController.java     # /api/analytics/**
│   ├── AuthController.java          # /api/auth/**
│   ├── CheckInController.java       # /api/check-in
│   ├── EventController.java         # /api/events/**
│   └── RegistrationController.java  # /api/registrations/**
│
├── services/
│   ├── AnalyticsService.java         # Scoped (organizer) or global (admin) metrics
│   ├── AuthService.java              # Register, login, getCurrentUser
│   ├── CheckInService.java           # QR token validation + status update
│   ├── EventService.java             # CRUD with Admin override bypass
│   ├── QRCodeService.java            # ZXing Base64 PNG generator
│   └── RegistrationService.java      # Register, cancel, guest list, my-tickets
│
├── entities/
│   ├── Event.java
│   ├── Registration.java    # Status enum: REGISTERED / CHECKED_IN / CANCELLED
│   ├── Role.java
│   ├── Ticket.java          # qr_token (unique TEXT)
│   └── User.java
│
├── repositories/            # Spring Data JPA interfaces
│   ├── EventRepository.java
│   ├── RegistrationRepository.java
│   ├── RoleRepository.java
│   ├── TicketRepository.java
│   └── UserRepository.java
│
├── dto/                     # Java records for request/response bodies
│   ├── AnalyticsDashboardDTO.java
│   ├── AuthDTOs.java
│   ├── CheckInDTOs.java
│   └── EventDTOs.java
│
└── security/
    ├── CustomUserDetailsService.java     # Loads user by email for Spring Security
    ├── JwtAuthenticationFilter.java      # @Component — reads Bearer token, sets context
    └── JwtTokenProvider.java             # Token generation and validation
```

---

## API Endpoints

### Authentication
```
POST  /api/auth/register    → { accessToken, userId, name, email, role }
POST  /api/auth/login       → { accessToken, userId, name, email, role }
GET   /api/auth/me          → { id, name, email, role }   [Bearer]
```

### Events
```
GET    /api/events                  → List<EventResponse>   [Public]
GET    /api/events/{id}             → EventResponse         [Public]
GET    /api/events/organizer        → List<EventResponse>   [ORGANIZER, ADMIN]
POST   /api/events                  → EventResponse         [ORGANIZER, ADMIN]
PUT    /api/events/{id}             → EventResponse         [ORGANIZER (own), ADMIN (any)]
DELETE /api/events/{id}             → 204 No Content        [ORGANIZER (own), ADMIN (any)]
```

### Registrations
```
POST   /api/registrations/event/{id}           → 200 OK              [Authenticated]
GET    /api/registrations/my-tickets           → List<TicketView>    [Authenticated]
DELETE /api/registrations/{id}                 → 200 OK              [Authenticated (own)]
GET    /api/registrations/event/{id}/guests    → List<GuestView>     [ORGANIZER (own), ADMIN (any)]
```

`TicketView` includes `qrToken` (raw text) and `qrBase64` (data URI for `<img>`).
`GuestView` includes attendee name, email, status, and registration time.

### Check-In
```
POST  /api/check-in    body: { qrToken }   → CheckInResponse   [ORGANIZER, ADMIN]
```
`CheckInResponse`: `{ success, message, attendeeName, eventTitle }`

### Analytics
```
GET   /api/analytics/dashboard   → AnalyticsDashboardDTO   [ORGANIZER (own), ADMIN (global)]
```

### Admin
```
GET   /api/admin/users    → List<UserView>     [ADMIN only]
GET   /api/admin/events   → List<EventResponse>[ADMIN only]
```

---

## Security Model

```
Request
  └─► JwtAuthenticationFilter  (@Component, OncePerRequestFilter)
        ├─ Extract Bearer token from Authorization header
        ├─ Validate signature + expiry (JwtTokenProvider)
        └─ Set SecurityContext → Spring applies @PreAuthorize rules

Roles (stored as ROLE_* in DB):
  ROLE_ADMIN      → all endpoints; bypasses ownership checks in EventService
  ROLE_ORGANIZER  → own events CRUD, check-in, analytics (scoped), guest lists (own)
  ROLE_ATTENDEE   → registration, cancel, my-tickets
```

---

## QR Code Flow

```
POST /api/registrations/event/{id}
  1. Duplicate check   → 400 if already registered
  2. Capacity check    → 400 if event full
  3. Save Registration  (status = REGISTERED)
  4. QRCodeService.generateToken() → "ES-{id}-{HEX16}"
  5. Save Ticket(qrToken)
  ✓  Registration confirmed

GET /api/registrations/my-tickets
  → For each non-cancelled registration:
     QRCodeService.generateQRCodeBase64(qrToken)
     → ZXing encodes token → PNG bytes → Base64 → data URI
     Returns TicketView { ..., qrBase64: "data:image/png;base64,..." }

DELETE /api/registrations/{id}
  1. Ownership check   → 403 if not your registration
  2. CHECKED_IN check  → 400 cannot cancel after check-in
  3. CANCELLED check   → 400 already cancelled
  4. registration.setStatus(CANCELLED)
  ✓  Capacity slot freed

POST /api/check-in { qrToken }
  1. Find ticket by token   → 400 if not found
  2. Check CHECKED_IN       → 400 "already used"
  3. Check CANCELLED        → 400 "cancelled"
  4. registration.setStatus(CHECKED_IN)
  ✓  { success: true, attendeeName, eventTitle }
```

---

## Running Tests

```bash
./mvnw test
```

Integration tests require a running MySQL instance (or H2 in-memory for unit tests).
