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

**EventSphere** is a production-ready, full-stack event management system built to showcase advanced JavaScript/React and Java/Spring Boot engineering. It handles the complete lifecycle of an event — from creation and attendee registration all the way through to real-time QR-code-based check-in and analytics reporting.

The frontend is built with a premium **"Liquid Glass"** design language — an Apple-inspired aesthetic using heavy backdrop blur, monochrome palettes, translucent borders, and physics-based Framer Motion animations throughout.

---

## ✨ Feature Overview

### 🔐 Authentication & Roles
- Stateless JWT authentication (Bearer tokens)
- Three RBAC roles: **Admin**, **Organizer**, **Attendee**
- Secure registration, login, and token rehydration from `localStorage`
- Role-based routing — each role lands on their own dashboard after login

### 📅 Event Management (Organizer)
- Full CRUD: create, edit, delete events with title, description, date, location, and capacity
- Staggered-animation event card grid with animated capacity progress bars
- Organizer owns their events — only they can edit/delete them
- Stats row: Total Events · Total Registered · Total Capacity · Nearly Full count

### 🎟️ Attendee Registration
- Browse all upcoming events with a live search filter
- One-click registration with real-time capacity and duplicate-registration checks
- Auto-switches to "My Tickets" tab after successful registration

### 📱 QR Ticketing (Apple Wallet Style)
- **ZXing** generates a `300×300` PNG QR code on the backend
- Encoded as a `data:image/png;base64,…` URI — no file storage needed
- Rendered inside a **3D magnetic hover Wallet Pass** (`TicketPass.jsx`)
  - Physics-based tilt using `useSpring` + `useTransform`
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
- Per-event breakdown rows with dual-layer progress bars (fill + check-in)
- Organizer-scoped or Admin-global depending on role

### ⚙️ DevOps / Production
- Multi-stage **Dockerfile** (JDK build → JRE runtime, non-root user)
- **GitHub Actions CI** — Maven tests with MySQL service, Vite build, Docker image
- Environment-aware API URL via `VITE_API_BASE_URL`
- Deploy-ready for **Render** (backend) + **Vercel** (frontend)

---

## 🏗️ Project Structure

```
Eventsphere/
├── backend/                    # Spring Boot 3 API
│   ├── src/main/java/com/eventsphere/
│   │   ├── controllers/        # REST controllers
│   │   ├── services/           # Business logic
│   │   ├── entities/           # JPA entities
│   │   ├── repositories/       # Spring Data JPA
│   │   ├── dto/                # Request/Response records
│   │   ├── security/           # JWT filter + config
│   │   └── config/             # CORS, beans
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── schema.sql          # Auto-run DDL
│   ├── Dockerfile              # Multi-stage container build
│   └── pom.xml
│
├── frontend/                   # React 19 + Vite 8 (JSX)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx          # Liquid Glass login/register
│   │   │   ├── OrganizerDashboard.jsx
│   │   │   ├── AttendeePortal.jsx
│   │   │   └── AnalyticsDashboard.jsx
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── TicketPass.jsx    # Apple Wallet QR card
│   │   │   │   └── ScannerPanel.jsx
│   │   │   └── ui/
│   │   │       ├── GlassButton.jsx
│   │   │       ├── GlassInput.jsx
│   │   │       ├── GlassCard.jsx
│   │   │       └── AnimatedCounter.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global JWT state
│   │   ├── services/
│   │   │   └── api.js                # Axios + interceptors
│   │   ├── App.jsx                   # Role-based router
│   │   └── assets/index.css          # Global styles + @keyframes
│   ├── .env                          # VITE_API_BASE_URL (local)
│   ├── .env.production               # VITE_API_BASE_URL (Render)
│   └── vite.config.js
│
└── .github/
    └── workflows/
        └── ci.yml              # GitHub Actions pipeline
```

---

## 🗄️ Database Schema

```
users              events               registrations          tickets
──────────         ──────────           ──────────────────     ───────────
id (PK)            id (PK)              id (PK)                id (PK)
name               title                event_id (FK)          registration_id (FK)
email (unique)     description          attendee_id (FK)       qr_token (unique)
password_hash      date                 status (enum)          created_at
role (enum)        location             registered_at
created_at         capacity
                   organizer_id (FK)
                   created_at
```

---

## 🔌 API Reference

### Auth  `POST /api/auth/...`
| Endpoint | Auth | Description |
|---|---|---|
| `POST /register` | Public | Register with name, email, password, role |
| `POST /login` | Public | Returns `{ accessToken, userId, name, email, role }` |
| `GET /me` | Bearer | Returns current user info |

### Events  `GET /api/events/...`
| Endpoint | Auth | Description |
|---|---|---|
| `GET /` | Public | All upcoming events |
| `GET /{id}` | Public | Single event |
| `GET /organizer` | ORGANIZER | Events created by current user |
| `POST /` | ORGANIZER | Create event |
| `PUT /{id}` | ORGANIZER | Update event (owner only) |
| `DELETE /{id}` | ORGANIZER | Delete event (owner only) |

### Registrations  `POST /api/registrations/...`
| Endpoint | Auth | Description |
|---|---|---|
| `POST /event/{id}` | ATTENDEE | Register + generate QR ticket |
| `GET /my-tickets` | ATTENDEE | All tickets with `qrBase64` image |

### Check-In  `/api/check-in`
| Endpoint | Auth | Description |
|---|---|---|
| `POST /` | ORGANIZER | Validate QR token, mark CHECKED_IN |

### Analytics  `/api/analytics`
| Endpoint | Auth | Description |
|---|---|---|
| `GET /dashboard` | ORGANIZER | Scoped metrics + event breakdown |
| `GET /dashboard` | ADMIN | Global metrics across all events |

---

## 🚀 Quick Start

> See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for full setup details.

### Prerequisites
| Tool | Version |
|---|---|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 20+ |
| MySQL | 8.0+ |

### 1 — Database
```sql
CREATE DATABASE eventsphere;
```

### 2 — Backend
```bash
cd backend
# Edit src/main/resources/application.properties if needed
mvn spring-boot:run
# API ready at http://localhost:8080
```

### 3 — Frontend
```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

### Default Credentials (after first register)
Create accounts via the UI:
- **Attendee** → logs into Event Portal
- **Organizer** → logs into Organizer Dashboard + Analytics

---

## 🐳 Docker

```bash
# Build the backend image
cd backend
docker build -t eventsphere-api .

# Run with your DB config
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/eventsphere \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root \
  eventsphere-api
```

---

## ☁️ Production Deployment

| Service | Where |
|---|---|
| Backend | [Render](https://render.com) — Docker Web Service, Root Dir: `backend/` |
| Frontend | [Vercel](https://vercel.com) — Vite preset, Root Dir: `frontend/` |
| Database | [Aiven](https://aiven.io) or AWS RDS MySQL 8.0 |

After deployment, set `VITE_API_BASE_URL` in Vercel to your Render API URL.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Spring Boot 3.x |
| Security | Spring Security + jjwt |
| Persistence | Spring Data JPA + Hibernate |
| Database | MySQL 8.0 |
| QR Code | ZXing 3.5.2 (Google) |
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
