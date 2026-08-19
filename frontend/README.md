# EventSphere — Frontend

React 19 + Vite 8 SPA for the EventSphere event management platform.  
Styled with the **Hardware Brutalism** monochrome design language — IBM Plex Mono + VT323 typefaces, a strict 60/30/10 CSS variable color system, CRT scanline overlays, mechanical press animations, and hard-offset box shadows. No design framework; all styling is pure CSS variables and `grit-*` utility classes from `index.css`.

---

## Tech Stack

| | |
|---|---|
| Framework | React 19 (JSX only — no TypeScript) |
| Bundler | Vite 8 |
| Animations | Framer Motion 13 |
| Charts | Apache ECharts (`echarts-for-react`) |
| QR Reader | `@zxing/browser` (BrowserMultiFormatReader) |
| Icons | Lucide React |
| HTTP | Axios |
| Routing | React Router DOM v7 |
| Fonts | VT323 + IBM Plex Mono (Google Fonts) |

---

## Prerequisites

- **Node.js 20+**
- Backend running at `http://localhost:8080`

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

The `VITE_API_BASE_URL` defaults to `http://localhost:8080/api` if no `.env` is present.

---

## Stopping the Dev Server / Managing Processes

If you see **"Port 5173 already in use"**, an old Vite/Node process is still running. Kill it first:

```powershell
# Windows — Kill by port
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -Force

# Windows — Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Windows — Find PID manually, then kill
netstat -ano | findstr ":5173"
Stop-Process -Id <PID> -Force
```

```bash
# Linux / macOS
kill -9 $(lsof -t -i:5173)
```

In VS Code terminal: press **Ctrl + C** to stop Vite, then click the **🗑️ trash icon** on the terminal tab to fully close it.

---

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

For production, set this in your hosting provider (Vercel etc.) — do NOT commit `.env.production`.

---

## Project Structure

```
frontend/src/
│
├── App.jsx                       # Root — router, role-based route guards
├── main.jsx                      # React DOM entry point
│
├── assets/
│   └── index.css                 # Hardware Brutalism design system
│                                   CSS variables (--anchor, --structure, --pop)
│                                   grit-* utility classes, keyframe animations,
│                                   light/dark theme switching via [data-theme]
│
├── context/
│   ├── AuthContext.jsx           # JWT state management
│   │                               login(email, password) → persists to localStorage
│   │                               register(name, email, password, role, dob, phoneNumber, city)
│   │                               logout() → clears localStorage
│   │                               Rehydrates on page refresh from eventsphere_token / eventsphere_user
│   └── ThemeContext.jsx          # data-theme attribute provider (dark / light toggle)
│
├── services/
│   └── api.js                    # Axios instance + all endpoint wrappers
│                                   authApi, eventsApi, organizerApi, attendeeApi,
│                                   registrationsApi, adminApi, checkInApi
│
├── pages/
│   ├── AdminLoginPage.jsx        # Dedicated admin login at /adminlogin
│   ├── AnalyticsDashboard.jsx    # Bento Box metrics grid + ECharts donuts
│   │                               Admin → global scope; Organizer → own events
│   ├── AttendeePortal.jsx        # Discover events + My Tickets + Cancel Registration
│   ├── AuthPage.jsx              # 3-step portal selection → login / register
│   │                               Expanded registration: Name, DOB, Phone, City, Email, Password
│   │                               Real-time SYS::PASSWORD DIAGNOSTIC checklist
│   ├── LandingPage.jsx           # Public marketing page at /
│   ├── OrganizerDashboard.jsx    # Event CRUD — equal 2-col CSS Grid, no metrics
│   └── OrganizerEventDetails.jsx # Per-event Bento Box: 6-col metric strip +
│                                   guest list table + ECharts donuts + scanner trigger
│
└── components/
    ├── shared/
    │   ├── Navbar.jsx            # Top navigation; exports useTheme() hook
    │   ├── ScannerPanel.jsx      # Check-In Command Center overlay modal
    │   │                           Camera Scan tab (@zxing auto-detect) + Manual Entry tab
    │   └── TicketPass.jsx        # QR ticket punch-card (REGISTERED / CHECKED_IN variants)
    └── ui/
        ├── AnimatedCounter.jsx   # Count-up stat numbers (Framer Motion)
        └── EventAccessModal.jsx  # Invite-code entry dialog for gated events
```

> **Note on removed components:** `GlassButton.jsx`, `GlassCard.jsx`, and `GlassInput.jsx` (Liquid Glass design system) have been removed. All styling now uses CSS variables and `grit-*` utility classes from `index.css` directly.

---

## Design System — Hardware Brutalism Monochrome

All colors across the entire application are governed by three CSS variable tokens. **No hardcoded color values (`black`, `white`, `#FDF6E3`, etc.) are permitted in component code.**

### 60/30/10 Color Rule

| Token | CSS Variable | Dark Mode | Light Mode | Role |
|---|---|---|---|---|
| **Anchor** (60%) | `var(--anchor)` | `#120E0B` | `#FDF6E3` | Dominant background — every surface |
| **Structure** (30%) | `var(--structure)` | `#FDF6E3` | `#120E0B` | Text, borders, empty states |
| **Pop** (10%) | `var(--pop)` | `#FFB300` | `#FFB300` | Accent only — CTAs, active states |

The **Pop** colour (`#FFB300` amber) is identical in both modes and is **never** used as a large surface background.

### Theme Switching

The `ThemeContext.jsx` sets a `data-theme` attribute on `<html>`. The stylesheet defines:

```css
/* Default — Dark Mode */
:root {
  --anchor:    #120E0B;
  --structure: #FDF6E3;
  --pop:       #FFB300;
}

/* Light Mode */
[data-theme="light"] {
  --anchor:    #FDF6E3;
  --structure: #120E0B;
  --pop:       #FFB300;   /* unchanged */
}
```

The theme toggle button (☀ / ☾) is in the header of every authenticated page.

### Typography

| Font | Usage |
|---|---|
| `VT323` | All `<h1>–<h4>` headings, large stat numbers — uppercase, terminal feel |
| `IBM Plex Mono` | All body text, labels, inputs, code — uppercase with letter-spacing |

### Micro-Animations

- **`.grit-btn:active`** — `translate(6px, 6px)` + `box-shadow: none` via `steps(3, end)` — mechanical depress
- **`.grit-card:hover`** — `translate(-3px, -3px)` + increased shadow offset — haptic lift
- **Film Grain SVG** — fixed, full-viewport `feTurbulence` overlay at 6% opacity on every page

---

## Routing

| Path | Component | Access |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/auth` | `AuthPage` | Public (redirects if authenticated) |
| `/login` | `AuthPage` | Public alias |
| `/adminlogin` | `AdminLoginPage` | Public — Admin-only portal |
| `/organizer/:username/dashboard` | `OrganizerDashboard` | ORGANIZER, ADMIN |
| `/organizer/:username/event/:id` | `OrganizerEventDetails` | ORGANIZER, ADMIN |
| `/attendee/:username/dashboard` | `AttendeePortal` | ATTENDEE |
| `/admin/dashboard` | `AnalyticsDashboard` | ADMIN only |

The URL slug (`:username`) is derived from the email address: `alice@acme.com → alice` via `emailToSlug()` in `AuthContext.jsx`.

---

## Authentication Flow

```
Registration (new user):
  AuthPage (step 1: portal selection → role locked)
  AuthPage (step 2: fill Name, DOB, Phone, City, Email, Password)
    └─► real-time SYS::PASSWORD DIAGNOSTIC checklist (5 rules)
    └─► submit button disabled until all rules pass + passwords match
  authApi.register({ name, email, password, role, dob, phoneNumber, city })
    └─► POST /api/auth/register
          ← { accessToken, tokenType, userId, name, email, role }
          → Stored in localStorage (eventsphere_token, eventsphere_user)
          → Navigate to role-specific dashboard URL

Login:
  authApi.login({ email, password })
    └─► POST /api/auth/login
          ← { accessToken, tokenType, userId, name, email, role }
          → Same persist + navigate flow

On page refresh:
  AuthProvider reads localStorage → sets user + token without API call

On 401/403 response:
  Axios interceptor → clears localStorage → redirects to /login
```

---

## Key Pages

### AuthPage (`/auth`)
- **Step 1:** Portal selection — "Attendee Portal" or "Creator Studio" (role locked)
- **Step 2:** Login or Register (role badge shown, back button returns to step 1)
- **Register fields:** Full Name · Date of Birth (≥18 enforced) · Phone Number (`+91` prefix locked, 10 digits) · City · Email · Password · Confirm Password
- **`SYS::PASSWORD DIAGNOSTIC` panel:** 5-rule real-time checklist appears as the user types — `[ ERR]` / `[ OK ]` terminal format
- **Right panel:** animated terminal log scrolling `TerminalPanel` (hidden on mobile)

### AdminLoginPage (`/adminlogin`)
- Separate portal hidden from the main auth flow
- After login, verifies `user.role === 'ROLE_ADMIN'`; non-admins are rejected and logged out

### OrganizerDashboard (`/organizer/:username/dashboard`)
- Equal 2-column CSS Grid of `TactileCard` event tiles — no asymmetric hero cards
- Per-card: capacity fill bar, `AT CAPACITY` tag (≥90%), access code copy badge
- Dashed-border draft tile always appears as the last slot
- **No global metrics row** — all analytics live in the per-event details page

### OrganizerEventDetails (`/organizer/:username/event/:id`)
- **Top row:** 6-column metric strip (Total Registered, Checked In, Pending, Capacity, Fill Rate, Available Seats)
- **Body:** 2-column layout — left: event info + full guest list table; right sidebar: two ECharts donut charts + "People Inside Now" counter
- `OPEN SCANNER` button triggers `ScannerPanel` full-screen overlay
  - **Camera Scan** tab: `@zxing/browser` auto-detect, live CRT overlay, amber sweep reticle
  - **Manual Entry** tab: paste/type `qr_token`, activate `VALIDATE` button

### AttendeePortal (`/attendee/:username/dashboard`)
- **Discover** tab: event grid with live search filter, capacity bars, register button
- **My Tickets** tab: `TicketPass` QR punch-card tickets (REGISTERED / CHECKED_IN variants)
- Cancel Registration button (only active on REGISTERED tickets)

### AnalyticsDashboard (`/admin/dashboard`)
- Global metrics for Admin role (all organizers' data combined)
- Animated count-up stat cards + ECharts donut charts

---

## API Service (`api.js`)

```js
// Auth
authApi.register({ name, email, password, role, dob, phoneNumber, city })
authApi.login({ email, password })
authApi.me()

// Events
eventsApi.available()                  // GET /events/available
eventsApi.getById(id)
eventsApi.create(data)
eventsApi.update(id, data)
eventsApi.delete(id)

// Organizer (scoped to JWT holder)
organizerApi.myEvents()               // GET /organizers/me/events
organizerApi.myDashboard()            // GET /organizers/me/dashboard

// Attendee (scoped to JWT holder)
attendeeApi.myTickets()               // GET /attendees/me/tickets

// Registrations
registrationsApi.register(eventId, eventCode)
registrationsApi.cancel(registrationId)
registrationsApi.guestList(eventId)

// Check-In
checkInApi.validate(qrToken)          // POST /events/check-in

// Admin
adminApi.getUsers()
adminApi.getEvents()
adminApi.analytics()
```

All endpoints share one Axios instance with:
- **Request interceptor:** attaches `Authorization: Bearer <token>` from `localStorage`
- **Response interceptor:** on `401`/`403` → clears storage + redirects to `/login`

---

## Build for Production

```bash
npm run build
# Output: dist/
```

Serve `dist/` from Vercel, Netlify, or any static host.  
Set `VITE_API_BASE_URL` to your deployed backend URL in your hosting environment.

---

## Linting

```bash
npm run lint
```

ESLint with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`.

---

## Password Requirements (UI-side enforcement)

The `SYS::PASSWORD DIAGNOSTIC` checklist in `AuthPage.jsx` enforces these rules in real-time. The submit button is disabled until all pass:

| Rule | Status display |
|---|---|
| 8 – 16 characters | `[ OK ]` amber / `[ ERR]` dim |
| 1 uppercase letter (A–Z) | `[ OK ]` amber / `[ ERR]` dim |
| 1 lowercase letter (a–z) | `[ OK ]` amber / `[ ERR]` dim |
| 1 number (0–9) | `[ OK ]` amber / `[ ERR]` dim |
| 1 special symbol (`@$!%*?&#^()_-+=`) | `[ OK ]` amber / `[ ERR]` dim |

The backend enforces the identical ruleset independently. See `TROUBLESHOOTING.md #25` if the frontend checklist and backend validation drift out of sync.
