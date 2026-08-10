<div align="center">

# 🌐 EventSphere

### Enterprise-grade Event Management Platform

**Full-stack · Spring Boot 3 · React 19 · JWT · ZXing QR · Liquid Glass UI**

---

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📖 What is EventSphere?

**EventSphere** is a production-ready, full-stack event management platform built to showcase advanced JavaScript/React and Java/Spring Boot engineering. It handles the complete lifecycle of an event — from creation and attendee registration through to real-time QR-code-based check-in and analytics reporting.

The frontend uses a premium **"Liquid Glass"** design language — Apple-inspired heavy backdrop blur, monochrome palette, translucent borders, and Framer Motion physics-based animations.

---

## ✨ Feature Overview

### 🔐 Authentication & Role-Based Access (RBAC)
- Stateless JWT authentication (Bearer tokens) via Spring Security
- Three roles with strict access control:
  - **Admin** — global platform oversight (all events, all users, global analytics)
  - **Organizer** — scoped to own events (CRUD, scanner, analytics, guest lists)
  - **Attendee** — register/cancel for events, personal QR ticket passbook
- **Portal Selection screen** — users choose "Attendee Portal" or "Creator Studio" *before* entering credentials; role is locked in at step 1 so registration always sends the correct `ROLE_ATTENDEE` / `ROLE_ORGANIZER` payload
- Dedicated admin login at `/adminlogin` (hidden from regular sign-up flow)
- Secure registration and login; token rehydrated from `localStorage` on refresh
- Role-based routing — each role lands on its own dashboard

### 📅 Event Management (Organizer)
- Full CRUD: create, edit, delete events with title, description, date, location, capacity
- Staggered-animation event card grid with live capacity progress bars
- Organizer owns their events — only they (or an Admin) can edit/delete
- Stats row: Total Events · Total Registered · Total Capacity · Nearly Full count
- **Guest List:** View all attendees registered for any of your events

### 🎟️ Attendee Portal
- Browse all upcoming events with a live search filter
- One-click registration with real-time capacity and duplicate-registration checks
- **Cancel Registration** — free up your spot at any time (before check-in)
- Auto-switches to "My Tickets" tab after successful registration

### 📱 QR Ticketing (Apple Wallet Style)
- **ZXing** generates a `300×300` PNG QR code on the backend
- Encoded as `data:image/png;base64,…` — no file storage needed
- Rendered inside a **3D magnetic hover Wallet Pass** (`TicketPass.jsx`)
  - Physics-based tilt with `useSpring` + `useTransform`
  - Cursor-chasing specular glare overlay
  - Apple Wallet perforated divider (notched circles + dashed line)
  - `CHECKED_IN` green state variant

### 🔍 QR Check-In (Organizer Scanner)
- **ScannerPanel** lets organizers paste/type a QR token to validate
- Backend guards: invalid token, already checked-in, cancelled registration
- Returns attendee name + event name on success

### 📊 Analytics Dashboard
- Animated count-up stat cards (`useSpring` from 0 → value)
- SVG ring charts for **fill rate** and **attendance rate**
- Animated funnel bar: Capacity → Registered → Checked In
- Per-event breakdown rows with dual-layer progress bars
- **Admin** sees global metrics; **Organizer** sees only their own events

### 🛡️ Admin Portal
- Dedicated login at `/adminlogin` (not accessible via regular sign-up)
- Auto-seeded admin account via `DataSeeder.java` on first boot
- `GET /api/admin/users` — view all platform users
- `GET /api/admin/events` — view every event across all organizers

### ⚙️ DevOps / Production
- Multi-stage **Dockerfile** (JDK build → JRE runtime, non-root user)
- **GitHub Actions CI** — Maven build + tests with MySQL service, Vite build, Docker image
- Environment-aware API URL via `VITE_API_BASE_URL`
- Deploy-ready for **Render** (backend) + **Vercel** (frontend)

---

## 🏗️ Project Structure

```
Eventsphere/
├── backend/                         # Spring Boot 3 API
│   ├── src/main/java/com/eventsphere/
│   │   ├── config/
│   │   │   ├── DataSeeder.java          # Seeds default admin on first boot
│   │   │   ├── SecurityConfig.java      # JWT filter chain, CORS, RBAC rules
│   │   │   └── WebConfig.java           # CORS bean
│   │   ├── controllers/
│   │   │   ├── AdminController.java         # /api/admin/** (ADMIN only)
│   │   │   ├── AnalyticsController.java     # /api/analytics/**
│   │   │   ├── AttendeeController.java      # /api/attendee/** (ATTENDEE)
│   │   │   ├── AuthController.java          # /api/auth/** (public)
│   │   │   ├── CheckInController.java       # /api/check-in (ORGANIZER, ADMIN)
│   │   │   ├── EventController.java         # /api/events/**
│   │   │   ├── OrganizerController.java     # /api/organizer/** (ORGANIZER, ADMIN)
│   │   │   └── RegistrationController.java  # /api/registrations/**
│   │   ├── services/
│   │   │   ├── AnalyticsService.java
│   │   │   ├── AuthService.java
│   │   │   ├── CheckInService.java
│   │   │   ├── EventSecurityService.java    # Ownership checks (ORGANIZER vs ADMIN)
│   │   │   ├── EventService.java            # Admin bypasses ownership checks
│   │   │   ├── QRCodeService.java           # ZXing Base64 QR generator
│   │   │   └── RegistrationService.java     # Register, cancel, guest list
│   │   ├── entities/
│   │   │   ├── Event.java
│   │   │   ├── Registration.java     # Status: REGISTERED / CHECKED_IN / CANCELLED
│   │   │   ├── Role.java
│   │   │   ├── Ticket.java           # qr_token (unique UUID-based)
│   │   │   └── User.java
│   │   ├── repositories/             # Spring Data JPA interfaces
│   │   │   ├── EventRepository.java
│   │   │   ├── RegistrationRepository.java
│   │   │   ├── RoleRepository.java
│   │   │   ├── TicketRepository.java
│   │   │   └── UserRepository.java
│   │   ├── dto/                      # Java records for request/response shapes
│   │   │   ├── AnalyticsDashboardDTO.java
│   │   │   ├── AuthDTOs.java
│   │   │   ├── CheckInDTOs.java
│   │   │   └── EventDTOs.java
│   │   └── security/
│   │       ├── CustomUserDetailsService.java
│   │       ├── JwtAuthenticationFilter.java  # @Component, reads Bearer header
│   │       └── JwtTokenProvider.java         # HS256 sign / validate
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── schema.sql                # Auto-run DDL (6 tables)
│   ├── Dockerfile                    # Multi-stage JDK build → JRE runtime
│   ├── mvnw / mvnw.cmd               # Maven wrapper (no Maven install needed)
│   └── pom.xml
│
├── frontend/                         # React 19 + Vite 8 (JSX only)
│   ├── src/
│   │   ├── App.jsx                   # Root router + role-based route guards
│   │   ├── main.jsx                  # React DOM entry point
│   │   ├── assets/
│   │   │   └── index.css             # Global styles, @keyframes, font imports
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # JWT state (login/register/logout/rehydrate)
│   │   ├── services/
│   │   │   └── api.js                # Axios instance + all API calls
│   │   ├── pages/
│   │   │   ├── AdminLoginPage.jsx    # Dedicated admin login at /adminlogin
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── AttendeePortal.jsx    # Discover + My Tickets + Cancel
│   │   │   ├── AuthPage.jsx          # Portal selection → Liquid Glass login/register
│   │   │   ├── LandingPage.jsx       # Public marketing page at /
│   │   │   └── OrganizerDashboard.jsx
│   │   └── components/
│   │       ├── shared/
│   │       │   ├── Navbar.jsx        # Sticky nav for authenticated dashboards
│   │       │   ├── ScannerPanel.jsx  # QR check-in modal (ORGANIZER)
│   │       │   └── TicketPass.jsx    # Apple Wallet-style 3D QR card
│   │       └── ui/
│   │           ├── AnimatedCounter.jsx   # Count-up stat numbers
│   │           ├── EventAccessModal.jsx  # Invite-code entry dialog
│   │           ├── GlassButton.jsx
│   │           ├── GlassCard.jsx
│   │           └── GlassInput.jsx
│   ├── .env                          # VITE_API_BASE_URL=http://localhost:8080/api
│   ├── .env.production               # VITE_API_BASE_URL (Render URL) — gitignored
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI (Maven + Vite + Docker)
├── .gitignore                        # Covers Java, Node, IDE, OS, secrets
├── TEST_CREDENTIALS.env              # Local test accounts — gitignored
├── TROUBLESHOOTING.md                # Real bugs encountered + fixes applied
└── README.md
```

---

## 🗄️ Database Schema

```
users                events               registrations        tickets
──────────           ──────────           ──────────────────   ───────────
id (PK)              id (PK)              id (PK)              id (PK)
name                 title                event_id (FK)        registration_id (FK)
email (unique)       description          attendee_id (FK)     qr_token (unique TEXT)
password_hash        date                 status (enum)        issued_at
created_at           location             registered_at
                     capacity
                     organizer_id (FK)
                     created_at

roles                user_roles
──────────           ──────────────────
id (PK)              user_id (FK)
name (unique)        role_id (FK)
```

---

## 🔌 API Reference

### Auth  `POST /api/auth/...`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register (name, email, password, role) |
| `POST` | `/api/auth/login` | Public | Returns `{ accessToken, userId, name, email, role }` |
| `GET`  | `/api/auth/me` | Bearer | Returns current user info |

### Events  `/api/events/...`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET`    | `/api/events` | Public | All upcoming events |
| `GET`    | `/api/events/{id}` | Public | Single event |
| `GET`    | `/api/events/organizer` | ORGANIZER, ADMIN | Events by current user |
| `POST`   | `/api/events` | ORGANIZER, ADMIN | Create event |
| `PUT`    | `/api/events/{id}` | ORGANIZER (own), ADMIN (any) | Update event |
| `DELETE` | `/api/events/{id}` | ORGANIZER (own), ADMIN (any) | Delete event |

### Registrations  `/api/registrations/...`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST`   | `/api/registrations/event/{id}` | Authenticated | Register + generate QR ticket |
| `GET`    | `/api/registrations/my-tickets` | Authenticated | All tickets with `qrBase64` |
| `DELETE` | `/api/registrations/{id}` | Authenticated (own) | Cancel registration |
| `GET`    | `/api/registrations/event/{id}/guests` | ORGANIZER (own), ADMIN (any) | Guest list |

### Check-In  `/api/check-in`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/check-in` | ORGANIZER, ADMIN | Validate QR token, mark CHECKED_IN |

### Analytics  `/api/analytics/...`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | ORGANIZER (own), ADMIN (global) | Metrics + event breakdown |

### Admin  `/api/admin/...`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | ADMIN only | All platform users |
| `GET` | `/api/admin/events` | ADMIN only | All events (all organizers) |

---

## 🚀 Quick Start

> See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for full setup details.

### Prerequisites
| Tool | Version | Notes |
|---|---|---|
| Java | 17+ | [Temurin](https://adoptium.net/) recommended |
| Maven | — | Bundled via `mvnw` wrapper — **no install needed** |
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| MySQL | 8.0+ | Running locally on port 3306 |

### 1 — Database
```sql
-- Run once in your MySQL shell or Workbench
CREATE DATABASE eventsphere;
```
Tables are created automatically from `schema.sql` on first startup.

### 2 — Backend
```powershell
cd backend
# Windows
.\mvnw.cmd spring-boot:run
# Linux / macOS
./mvnw spring-boot:run
# API ready at http://localhost:8080
```
On first boot, `DataSeeder.java` auto-creates the Admin account.

### 3 — Frontend
```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

### Test Accounts
See `TEST_CREDENTIALS.env` at the project root (gitignored).

| Role | Login URL | Portal | Default Email | Password |
|---|---|---|---|---|
| **Admin** | `/adminlogin` | Admin-only portal | `admin@eventsphere.com` | `admin123` |
| **Organizer** | `/login` → Creator Studio | Select "Creator Studio" | Register via UI | your choice |
| **Attendee** | `/login` → Attendee Portal | Select "Attendee Portal" | Register via UI | your choice |

---

## 🛑 Stopping Servers / Managing Processes

If you see **"Port already in use"** when restarting, an old process is still running. Kill it first, then start again.

### Kill by port (Windows — PowerShell)

```powershell
# Kill the backend (port 8080)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess -Force

# Kill the frontend dev server (port 5173)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -Force
```

### Kill all at once (nuclear option)

```powershell
# Windows — kills all Java + Node processes
Get-Process java, node -ErrorAction SilentlyContinue | Stop-Process -Force
```

```bash
# Linux / macOS
kill -9 $(lsof -t -i:8080)   # backend
kill -9 $(lsof -t -i:5173)   # frontend
```

### Find PID manually, then kill

```powershell
# Windows
netstat -ano | findstr ":8080 :5173"
Stop-Process -Id <PID> -Force
```

### In VS Code terminal
Press **Ctrl + C** to stop the running process first, then click the **🗑️ trash icon** on the terminal tab to close it completely.

---

## 🐳 Docker

```bash
# Build backend image (from /backend)
docker build -t eventsphere-api .

# Run with your DB config
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/eventsphere \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root \
  -e APP_JWT_SECRET=change-me-in-production \
  eventsphere-api
```

---

## ☁️ Production Deployment

| Service | Platform | Config |
|---|---|---|
| Backend | [Render](https://render.com) | Docker Web Service, Root Dir: `backend/` |
| Frontend | [Vercel](https://vercel.com) | Vite preset, Root Dir: `frontend/` |
| Database | [Aiven](https://aiven.io) or AWS RDS | MySQL 8.0 |

Set these environment variables on Render:
```
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:<port>/eventsphere
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
APP_JWT_SECRET=<long-random-string>
```

Set on Vercel:
```
VITE_API_BASE_URL=https://your-app.onrender.com/api
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Spring Boot 3.x |
| Security | Spring Security 6 + JJWT 0.12 |
| Persistence | Spring Data JPA (Hibernate 6) |
| Database | MySQL 8.0 |
| QR Code | ZXing 3.5.3 (Google) |
| Frontend Framework | React 19 + Vite 8 |
| Animations | Framer Motion 13 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router DOM v7 |
| Containerisation | Docker (multi-stage) |
| CI/CD | GitHub Actions |

---

<div align="center">
Built with ❤️ — EventSphere · 2026
</div>
