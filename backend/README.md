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
| QR Codes | Google ZXing 3.5.2 |
| Utilities | Lombok |
| Build | Maven 3.8+ |

---

## Prerequisites

- **Java 17+** — [Download Temurin](https://adoptium.net/)
- **Maven 3.8+** — bundled via `mvnw` wrapper (no install needed)
- **MySQL 8.0** running locally

---

## Database Setup

```sql
-- Run once in MySQL shell or Workbench
CREATE DATABASE eventsphere;
```

The schema is created **automatically** on first startup via `src/main/resources/schema.sql` (Spring's `spring.sql.init.mode=always`).

---

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# ── Database ──────────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/eventsphere
spring.datasource.username=root
spring.datasource.password=root

# ── JPA ───────────────────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=validate
spring.sql.init.mode=always

# ── JWT ───────────────────────────────────────────────────────────
# Change this to a long random string in production!
app.jwt.secret=eventsphere-super-secret-key-change-me-in-production
app.jwt.expiration-ms=86400000

# ── Server ────────────────────────────────────────────────────────
server.port=8080
```

> **Production:** Inject `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, and `APP_JWT_SECRET` as environment variables — never commit secrets.

---

## Running Locally

```bash
# From the /backend directory
./mvnw spring-boot:run
```

Or on Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The API will be available at **http://localhost:8080**

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
  eventsphere-api
```

The Dockerfile is multi-stage:
- **Stage 1 (build):** `eclipse-temurin:17-jdk-alpine` compiles and packages
- **Stage 2 (run):** `eclipse-temurin:17-jre-alpine` — lean ~130 MB image, non-root user

---

## Package Structure

```
com.eventsphere/
├── controllers/
│   ├── AuthController.java          # /api/auth/**
│   ├── EventController.java         # /api/events/**
│   ├── RegistrationController.java  # /api/registrations/**
│   ├── CheckInController.java       # /api/check-in
│   └── AnalyticsController.java     # /api/analytics/**
│
├── services/
│   ├── AuthService.java
│   ├── EventService.java
│   ├── RegistrationService.java
│   ├── CheckInService.java
│   ├── AnalyticsService.java
│   └── QRCodeService.java           # ZXing Base64 generator
│
├── entities/
│   ├── User.java                    # ROLE_ADMIN / ROLE_ORGANIZER / ROLE_ATTENDEE
│   ├── Event.java
│   ├── Registration.java            # Status: REGISTERED / CHECKED_IN / CANCELLED
│   └── Ticket.java                  # qr_token (unique)
│
├── repositories/                    # Spring Data JPA interfaces
├── dto/                             # Java records for request/response
│
└── security/
    ├── JwtAuthenticationFilter.java # Reads Bearer token from headers
    ├── JwtService.java              # Token generation + validation
    ├── SecurityConfig.java          # Stateless filter chain, CORS, RBAC
    └── CustomUserDetailsService.java
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register       → { accessToken, userId, name, email, role }
POST   /api/auth/login          → { accessToken, userId, name, email, role }
GET    /api/auth/me             → { id, name, email, role }  [Bearer]
```

### Events
```
GET    /api/events              → List<EventResponse>         [Public]
GET    /api/events/{id}         → EventResponse               [Public]
GET    /api/events/organizer    → List<EventResponse>         [ORGANIZER]
POST   /api/events              → EventResponse               [ORGANIZER]
PUT    /api/events/{id}         → EventResponse               [ORGANIZER, owner]
DELETE /api/events/{id}         → 204 No Content              [ORGANIZER, owner]
```

### Registrations
```
POST   /api/registrations/event/{id}   → 200 / 400           [ATTENDEE]
GET    /api/registrations/my-tickets   → List<TicketView>     [ATTENDEE]
```
`TicketView` includes `qrToken` (raw text) and `qrBase64` (data URI for `<img>`).

### Check-In
```
POST   /api/check-in    body: { qrToken }   → CheckInResponse   [ORGANIZER]
```
`CheckInResponse`: `{ success, message, attendeeName, eventTitle }`

### Analytics
```
GET    /api/analytics/dashboard   → AnalyticsDashboardDTO   [ORGANIZER, ADMIN]
```
Organizers see only their own events; Admins see all.

---

## Security Model

```
Request
  └─► JwtAuthenticationFilter
        ├─ Extract Bearer token from Authorization header
        ├─ Validate signature + expiry
        └─ Set SecurityContext → Spring applies @PreAuthorize rules

Roles (stored as ROLE_* in DB):
  ROLE_ADMIN      → all endpoints
  ROLE_ORGANIZER  → events CRUD (own events), check-in, analytics
  ROLE_ATTENDEE   → registration, my-tickets
```

---

## QR Code Flow

```
POST /api/registrations/event/{id}
  1. Duplicate check   → 400 if already registered
  2. Capacity check    → 400 if event full
  3. Save Registration (status=REGISTERED)
  4. QRCodeService.generateToken() → "ES-{id}-{HEX16}"
  5. Save Ticket(qrToken)
  ✓  Registration confirmed

GET /api/registrations/my-tickets
  → For each ticket:
     QRCodeService.generateQRCodeBase64(qrToken)
     → ZXing encodes token → PNG bytes → Base64 → data URI
     Returns TicketView { ..., qrBase64: "data:image/png;base64,..." }

POST /api/check-in { qrToken }
  1. Find ticket by token   → 400 if not found
  2. Check CHECKED_IN       → 400 "already used"
  3. Check CANCELLED        → 400 "cancelled"
  4. registration.setStatus(CHECKED_IN)
  ✓  { success:true, attendeeName, eventTitle }
```

---

## Running Tests

```bash
./mvnw test
```

Integration tests require a running MySQL instance (or use H2 in-memory for unit tests).
