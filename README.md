<div align="center">

# 🖥️ EventSphere

### Enterprise-grade Event Management Platform

**Full-stack · Spring Boot 3 · React 19 · JWT · ZXing QR · Hardware Brutalism Monochrome UI**

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

**EventSphere** is a production-ready, full-stack event management platform built to showcase advanced JavaScript/React and Java/Spring Boot engineering. It handles the complete lifecycle of an event — from creation and attendee registration through to real-time QR-code-based check-in and per-event analytics.

The frontend uses a **"Hardware Brutalism"** design language — a maximalist, monochrome-first aesthetic built on IBM Plex Mono + VT323 typefaces, a strict 60/30/10 color rule, CRT scanline overlays, a stepped CSS Grid (Bento Box) layout, and mechanical press animations on every interactive element. The palette is intentionally stark: near-black anchor surfaces, near-white structure text/borders, and amber (`#FFB300`) used exclusively as the accent pop color.

---

## 🎨 Design System — Hardware Brutalism Monochrome

### 60/30/10 Color Rule

All UI elements across the entire application are governed by a strict three-token color system. Every developer working on this project must respect these roles:

| Token | CSS Variable | Dark Mode Value | Light Mode Value | Role |
|---|---|---|---|---|
| **Anchor** (60%) | `var(--anchor)` | `#120E0B` | `#FDF6E3` | Dominant background — fills cards, modals, every surface |
| **Structure** (30%) | `var(--structure)` | `#FDF6E3` | `#120E0B` | Text, borders, empty-state elements |
| **Pop** (10%) | `var(--pop)` | `#FFB300` | `#FFB300` | Accent-only — reserved for primary CTAs, checked-in status, active states |

The Pop colour (`--pop`) is **amber/gold** and is intentionally identical in both modes. It is **never** used as a background fill for large surfaces — only for borders, button fills on primary actions, and text on active states.

### Light / Dark Mode — Global via CSS Variables

Theme switching is handled entirely at the CSS level. The `ThemeProvider` context (in `ThemeContext.jsx`) sets a `data-theme` attribute on the `<html>` element. The stylesheet in `index.css` defines two variable blocks:

```css
/* Default — Dark Mode */
:root {
  --anchor:    #120E0B;   /* dominant background */
  --structure: #FDF6E3;   /* text, borders       */
  --pop:       #FFB300;   /* accent only         */
  --ink:       #FDF6E3;   /* shadow base         */
  --shadow:    6px 6px 0px var(--structure);
}

/* Light Mode */
[data-theme="light"] {
  --anchor:    #FDF6E3;
  --structure: #120E0B;
  --pop:       #FFB300;   /* unchanged — always amber */
  --ink:       #120E0B;
  --shadow:    6px 6px 0px var(--structure);
}
```

When the theme flips, `--anchor` and `--structure` swap values. Since all borders, shadows, text, and card backgrounds reference these variables, the **entire UI inverts correctly without a single hardcoded `black` or `white` in the components**.

The theme toggle button (☀ / ☾) is present in the header of every authenticated dashboard and calls the `toggle()` function exported from `ThemeContext.jsx`.

### Typography

| Font | Usage |
|---|---|
| `VT323` (Google Fonts) | All `<h1>–<h4>` headings, large stat numbers — uppercase, monospaced terminal feel |
| `IBM Plex Mono` (Google Fonts) | All body text, labels, meta tags, code — uppercase with wide letter-spacing |

### Micro-Animations

- **`.grit-btn:active`** — `translate(6px, 6px)` + `box-shadow: none` via `steps(3, end)` — mechanical depress effect
- **`.grit-card:hover`** — `translate(-3px, -3px)` + increased offset shadow — haptic lift
- **`.grit-draft:hover`** — border-color transitions from dim to `--structure`
- **Film Grain SVG** — fixed, full-viewport `feTurbulence` overlay at 6% opacity on every page

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
- Token rehydrated from `localStorage` on refresh via `AuthContext`
- Role-based routing — each role lands on its own URL slug: `/organizer/:username/dashboard`, `/attendee/:username/dashboard`

### 👤 Personnel Record — Profile View

Each authenticated user has access to a **Personnel Record** — the platform's terminal-styled profile page, designed to look like a classified hardware diagnostic screen.

**Two modes, toggled by a hardware-style tab bar:**

| Mode | Description |
|---|---|
| **DIAGNOSTIC (Read-Only)** | Displays all user fields as static, monospace data readouts. No inputs are active. This is the default view on page load. |
| **EDIT MODE** | Unlocks `name`, `dob`, `phoneNumber`, and `city` for editing. The user can submit changes via a `COMMIT CHANGES` button. |

**Key constraint — Locked Email field:**
> The `email` field is **always rendered as a disabled `<input>`** regardless of which mode is active. The email address is the primary authentication identifier and is immutable after account creation. Attempting to programmatically enable it will cause the backend to ignore the field (it is not part of the update DTO).

**UX pattern:**
- The page opens in Diagnostic mode (`isEditing = false`).
- Clicking `[ EDIT RECORD ]` sets `isEditing = true` and enables the mutable fields.
- Clicking `[ CANCEL ]` reverts `isEditing = false` and discards local changes.
- On successful `PUT /api/auth/me` submission, the mode returns to Read-Only and the displayed data updates from the API response.

### 📅 Event Management — Organizer Dashboard

The Organizer Dashboard (`OrganizerDashboard.jsx`) is a streamlined, focused view:

- **Event grid** — equal-width 2-column CSS Grid of `TactileCard` components (all `span 1`; no asymmetric hero cards)
- **Per-card capacity bar** — live fill percentage with `AT CAPACITY` tag when ≥ 90% full
- **Access Code badge** — inline clipboard copy of the event invite code
- **Draft tile** — dashed-border placeholder card always appears as the last slot
- **No global metrics row** — all capacity counts, fill rates, and attendance numbers have been removed from this page. They live exclusively on the Event Details page.

> **Design intent:** The dashboard is a command surface for managing events (create / edit / delete / navigate). Metrics belong in the per-event deep-dive context where they are actionable.

### 📊 Event Details & Analytics — Per-Event Deep Dive

`OrganizerEventDetails.jsx` is the analytics hub for a single event. It uses a **Bento Box CSS Grid** layout:

**Top row — 6-column metric strip:**

| Stat Block | Accent? |
|---|---|
| Total Registered | — |
| Checked In | ✅ `--pop` accent |
| Pending Arrival | — |
| Platform Capacity | — |
| Fill Rate | ✅ `--pop` when ≥ 90% |
| Available Seats | — |

**Two-column body layout (`1fr 360px`):**

- **Left column** — event info card (title, description, date, location, capacity meta grid) + full guest list table with per-row `REGISTERED` / `CHECKED_IN` / `CANCELLED` status badges
- **Right sidebar** (sticky) — two ECharts donut charts ("Registration Status" + "Attendance Breakdown") + a large "People Inside Now" hero counter

This is the only page where capacity and scanning metrics are displayed.

### 🔍 Check-In Command Center (`ScannerPanel.jsx`)

The scanner is accessed via the "OPEN SCANNER" primary CTA button in the Event Details page header. It opens as a full-screen overlay modal — a dedicated Check-In Command Center with two modes toggled by a hardware-style tab bar:

**Mode: Camera Scan**

- Uses `@zxing/browser` `BrowserMultiFormatReader` to stream the device camera
- Prefers rear-facing / environment camera; falls back to first available device
- Live video feed with CRT scanline overlay and a targeting reticle with animated amber sweep line
- Status badges: `INITIALIZING...` spinner → `● SCANNING LIVE` dot
- Auto-submits to the check-in API on first detected QR code — no button press needed
- Camera stream is torn down immediately on mode switch or modal close (no dangling `MediaStreamTrack`)

**Mode: Manual Entry**

- Paste or type the `qr_token` UUID string into a monospace `grit-input` field
- "VALIDATE" submit button activates in amber when the field has content
- Auto-focused on mount

**Result display (both modes):**

- `CHECK-IN OK` (amber `--pop` border) — shows attendee name + event title
- `CHECK-IN DENIED` (structure border) — shows error message from backend
- "SCAN ANOTHER" reset button returns to the active mode

### 🎟️ Attendee Portal

- Browse all upcoming events with a live search filter
- One-click registration with real-time capacity and duplicate-registration checks
- **Cancel Registration** — free up your spot at any time (before check-in)
- QR ticket displayed inside a `TicketPass.jsx` card — styled as a physical punch-card ticket with `CHECKED_IN` status variant

### 🛡️ Admin Portal

- Dedicated login at `/adminlogin` (not accessible via regular sign-up)
- Auto-seeded admin account via `DataSeeder.java` on first boot
- `GET /api/admin/users` — view all platform users
- `GET /api/admin/events` — view every event across all organizers
- `GET /api/admin/analytics` — global platform metrics (all registrations)
- Admin lands on `AnalyticsDashboard` which shows globally-scoped metrics

### ⚙️ DevOps / Production

- Multi-stage **Dockerfile** (JDK build → JRE runtime, non-root user)
- **GitHub Actions CI** — Maven build + tests with MySQL service, Vite build, Docker image
- Environment-aware API URL via `VITE_API_BASE_URL`
- Deploy-ready for **Render** (backend) + **Vercel** (frontend)

---

## 🏗️ Project Structure

```
Eventsphere/
├── backend/                          # Spring Boot 3 API
│   ├── src/main/java/com/eventsphere/
│   │   ├── config/
│   │   │   ├── DataSeeder.java           # Seeds default admin on first boot
│   │   │   ├── SecurityConfig.java       # JWT filter chain, CORS, RBAC rules
│   │   │   └── WebConfig.java            # CORS bean (allows localhost:5173)
│   │   ├── controllers/
│   │   │   ├── AdminController.java          # /api/admin/** (ADMIN only)
│   │   │   ├── AttendeeController.java       # /api/attendee/** (ATTENDEE)
│   │   │   ├── AuthController.java           # /api/auth/** (public)
│   │   │   ├── CheckInController.java        # /api/check-in (ORGANIZER, ADMIN)
│   │   │   ├── EventController.java          # /api/events/**
│   │   │   ├── OrganizerController.java      # /api/organizer/** (ORGANIZER, ADMIN)
│   │   │   └── RegistrationController.java   # /api/registrations/**
│   │   ├── services/
│   │   │   ├── AnalyticsService.java         # Aggregates metrics for Organizer and Admin
│   │   │   ├── AuthService.java              # Register, login, JWT issuance
│   │   │   ├── CheckInService.java           # QR token validation + CHECKED_IN state
│   │   │   ├── EventSecurityService.java     # Ownership checks (ORGANIZER vs ADMIN)
│   │   │   ├── EventService.java             # CRUD; Admin bypasses ownership checks
│   │   │   ├── QRCodeService.java            # ZXing Base64 QR generator
│   │   │   └── RegistrationService.java      # Register, cancel, guest list
│   │   ├── entities/
│   │   │   ├── Event.java
│   │   │   ├── Registration.java      # Status: REGISTERED / CHECKED_IN / CANCELLED
│   │   │   ├── Role.java
│   │   │   ├── Ticket.java            # qr_token (unique UUID-based)
│   │   │   └── User.java
│   │   ├── repositories/              # Spring Data JPA interfaces
│   │   │   ├── EventRepository.java
│   │   │   ├── RegistrationRepository.java
│   │   │   ├── RoleRepository.java
│   │   │   ├── TicketRepository.java
│   │   │   └── UserRepository.java
│   │   ├── dto/                       # Java records for request/response shapes
│   │   │   ├── AnalyticsDashboardDTO.java
│   │   │   ├── AuthDTOs.java
│   │   │   ├── CheckInDTOs.java
│   │   │   └── EventDTOs.java
│   │   └── security/
│   │       ├── CustomUserDetailsService.java
│   │       ├── JwtAuthenticationFilter.java   # @Component, reads Bearer header
│   │       └── JwtTokenProvider.java          # HS256 sign / validate
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── schema.sql                 # Auto-run DDL (6 tables)
│   ├── Dockerfile                     # Multi-stage JDK build → JRE runtime
│   ├── mvnw / mvnw.cmd                # Maven wrapper (no Maven install needed)
│   └── pom.xml
│
├── frontend/                          # React 19 + Vite 8 (JSX only)
│   ├── src/
│   │   ├── App.jsx                    # Root router + role-based route guards
│   │   ├── main.jsx                   # React DOM entry point
│   │   ├── assets/
│   │   │   └── index.css              # Retro Terminal design system — CSS variables,
│   │   │                              #   60/30/10 tokens, grit-* utility classes,
│   │   │                              #   keyframe animations, theme switching
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # JWT state (login/register/logout/rehydrate)
│   │   │   └── ThemeContext.jsx       # data-theme attribute provider (dark/light toggle)
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance + all API call functions
│   │   ├── pages/
│   │   │   ├── AdminLoginPage.jsx         # Dedicated admin login at /adminlogin
│   │   │   ├── AnalyticsDashboard.jsx     # Global analytics for Admin role
│   │   │   ├── AttendeePortal.jsx         # Discover + My Tickets + Cancel Registration
│   │   │   ├── AuthPage.jsx               # 3-step portal selection → login/register
│   │   │   ├── LandingPage.jsx            # Public marketing page at /
│   │   │   ├── OrganizerDashboard.jsx     # Event CRUD grid (no metrics — by design)
│   │   │   └── OrganizerEventDetails.jsx  # Per-event Bento Box: metrics + guest list
│   │   │                                  #   + ECharts donuts + scanner trigger
│   │   └── components/
│   │       ├── shared/
│   │       │   ├── Navbar.jsx             # Exports useTheme() hook; used by pages
│   │       │   │                          #   that manage their own header
│   │       │   ├── ScannerPanel.jsx       # Check-In Command Center overlay modal
│   │       │   │                          #   — Camera Scan tab + Manual Entry tab
│   │       │   └── TicketPass.jsx         # QR ticket card (punch-card style)
│   │       └── ui/
│   │           ├── AnimatedCounter.jsx    # Count-up stat numbers (Framer Motion)
│   │           └── EventAccessModal.jsx   # Invite-code entry dialog for gated events
│   ├── .env                           # VITE_API_BASE_URL=http://localhost:8080/api
│   ├── .env.production                # VITE_API_BASE_URL (Render URL) — gitignored
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI (Maven + Vite + Docker)
├── .gitignore
├── TEST_CREDENTIALS.env               # Local test accounts — gitignored
├── TROUBLESHOOTING.md                 # Real bugs encountered + fixes applied
└── README.md
```

> **Note on removed UI components:** The previous design iteration included `GlassButton.jsx`, `GlassCard.jsx`, and `GlassInput.jsx` (Liquid Glass design). These have been removed. All styling is now inline via CSS variables and `grit-*` utility classes from `index.css`.

---

## 🧩 How It All Works — Function Flow

```
Browser
  │
  ├── LandingPage (/)           → Public marketing page
  │
  ├── AuthPage (/login)         → 3-step portal selection → JWT issued by backend
  │     Step 1: Pick "Attendee Portal" or "Creator Studio"
  │     Step 2: Login / Register (role pre-selected)
  │     Step 3: Redirect to role-specific URL slug
  │
  ├── AdminLoginPage (/adminlogin) → Admin-only credentials → /admin/dashboard
  │
  ├── OrganizerDashboard (/organizer/:username/dashboard)
  │     ├── Create / Edit / Delete events (EventController)
  │     ├── Equal 2-column CSS Grid of TactileCard components
  │     └── Click event card → OrganizerEventDetails
  │
  ├── OrganizerEventDetails (/organizer/:username/event/:id)
  │     ├── 6-col Bento Box metric strip (registered, checked-in, capacity, etc.)
  │     ├── Left: Event info card + full guest list table
  │     ├── Right sidebar: ECharts donuts + "People Inside" counter
  │     └── OPEN SCANNER → ScannerPanel overlay
  │           ├── Camera Scan tab (@zxing/browser auto-detect)
  │           └── Manual Entry tab (paste / type qr_token)
  │
  ├── AttendeePortal (/attendee/:username/dashboard)
  │     ├── "Discover" tab — browse events (EventController)
  │     ├── Register for event (RegistrationController → register)
  │     ├── "My Tickets" tab — TicketPass QR cards
  │     └── Cancel registration (RegistrationController → cancel)
  │
  └── AnalyticsDashboard (/admin/dashboard)
        └── Global metrics — Admin role only
```

### Backend Request Lifecycle

```
HTTP Request
  → JwtAuthenticationFilter (validates Bearer token, sets SecurityContext)
  → Spring Security filter chain (RBAC rules from SecurityConfig)
  → Controller (@PreAuthorize / URL-level)
  → Service (business logic + ownership checks)
  → Repository (Spring Data JPA → MySQL)
  → Response DTO → JSON
```

### Key Data Relationships

```
User ──(ORGANIZER)──> Event
User ──(ATTENDEE)──>  Registration ──> Ticket (qr_token UUID)
Registration.status:  REGISTERED | CHECKED_IN | CANCELLED

CheckIn flow:
  ScannerPanel sends qr_token (camera auto-detect or manual paste)
  → CheckInController → CheckInService
  → Finds Ticket by token → validates Registration status
  → Sets Registration.status = CHECKED_IN
  → Returns attendee name + event title to UI
```

---

## 🗄️ Database Schema

### Users Table — Expanded Schema

The `users` table was expanded to store the full personnel record for each platform member. All five new fields are **mandatory** for both `ATTENDEE` and `ORGANIZER` roles during registration.

```
users
────────────────────────────────────────────────────────
id            BIGINT          PK, auto-increment
name          VARCHAR(255)    Full legal name — required
email         VARCHAR(255)    Unique — immutable after creation
password_hash VARCHAR(255)    BCrypt-hashed — never returned in API responses
dob           DATE            Date of birth (yyyy-MM-dd) — user must be ≥18
phone_number  VARCHAR(20)     10-digit string, stored without country code prefix
city          VARCHAR(255)    User's city of residence
created_at    TIMESTAMP       Auto-set on insert
```

> **Note on `phone_number`:** The UI displays a locked `+91` country code prefix, but the frontend sends only the raw 10-digit string (e.g. `"9876543210"`). The `+91` prefix is a **display-only** UX convention, not stored in the database.

### Other Tables

```
events               registrations        tickets
──────────           ──────────────────   ───────────
id (PK)              id (PK)              id (PK)
title                event_id (FK)        registration_id (FK)
description          attendee_id (FK)     qr_token (unique TEXT)
date                 status (enum)        issued_at
location             registered_at
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
| `POST` | `/api/auth/register` | Public | Register — requires: `name`, `email`, `password`, `role`, `dob`, `phoneNumber`, `city` |
| `POST` | `/api/auth/login` | Public | Returns `{ token, userId, name, email, role }` |
| `GET`  | `/api/auth/me` | Bearer | Returns full profile incl. `dob`, `phoneNumber`, `city` |

### 🔑 Password Security Requirements

All user passwords are enforced identically on both the **frontend** (real-time checklist) and **backend** (`AuthService.java`):

| Rule | Constraint |
|---|---|
| Length | 8 to 16 characters (inclusive) |
| Uppercase | At least 1 letter A–Z |
| Lowercase | At least 1 letter a–z |
| Number | At least 1 digit 0–9 |
| Special symbol | At least 1 character from `@$!%*?&#^()_-+=` |

**Frontend — Real-Time Mechanical Validation Checklist:**

While the user types in the `PASSWORD` field during registration, `AuthPage.jsx` renders a live `SYS::PASSWORD DIAGNOSTIC` panel. Each rule is displayed as a terminal diagnostic line:

```
SYS::PASSWORD DIAGNOSTIC
[ ERR] 8 – 16 CHARACTERS       ← red/dim until satisfied
[ OK ] 1 UPPERCASE LETTER      ← amber/bright when satisfied
[ ERR] 1 LOWERCASE LETTER
[ ERR] 1 NUMBER
[ ERR] 1 SPECIAL SYMBOL
```

- The `[ ERR]` prefix turns to `[ OK ]` (amber, full opacity) as each rule passes.
- The `CREATE ACCOUNT` submit button is **disabled** (`pointer-events: none`, `opacity: 0.45`) until all 5 rules show `[ OK ]` and the confirm-password field matches.
- The backend enforces the same ruleset independently via `AuthService.java` — a crafted API call bypassing the frontend will still receive a `400 Bad Request` with a specific error message per failing rule.

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
| `GET` | `/api/admin/analytics` | ADMIN only | Global platform metrics |

---

## 🚀 Quick Start

> See [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) if you hit any issues during setup.

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
| QR Code Generator | ZXing 3.5.3 (Google) |
| Frontend Framework | React 19 + Vite 8 |
| QR Reader (frontend) | @zxing/browser (BrowserMultiFormatReader) |
| Animations | Framer Motion 13 |
| Charts | Apache ECharts (echarts-for-react) |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router DOM v7 |
| Containerisation | Docker (multi-stage) |
| CI/CD | GitHub Actions |

---

<div align="center">
Built with ❤️ — EventSphere · 2026
</div>
