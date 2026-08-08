# EventSphere — Frontend

React 19 + Vite 8 SPA for the EventSphere event management platform.  
Styled with a premium **"Liquid Glass"** design language — heavy backdrop blur, monochrome palette, Framer Motion physics animations, and Apple-inspired UI components.

---

## Tech Stack

| | |
|---|---|
| Framework | React 19 (JSX only — no TypeScript) |
| Bundler | Vite 8 |
| Animations | Framer Motion 13 |
| Icons | Lucide React |
| HTTP | Axios |
| Routing | React Router DOM v7 |
| Fonts | Inter (Google Fonts) |

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
├── context/
│   └── AuthContext.jsx           # JWT state management
│                                   login(), register(), logout()
│                                   Token rehydrated from localStorage on refresh
│                                   login() returns user object for role checks
│
├── services/
│   └── api.js                    # Axios instance + all endpoint wrappers
│                                   authApi, eventsApi, registrationsApi,
│                                   checkInApi, analyticsApi, adminApi
│
├── pages/
│   ├── AdminLoginPage.jsx        # Dedicated admin login at /adminlogin
│   │                               Indigo accent design, role guard after login
│   ├── AnalyticsDashboard.jsx    # Animated stat cards, ring charts, funnel bars
│   │                               Admin → global; Organizer → own events only
│   ├── AttendeePortal.jsx        # Discover events + My Tickets + Cancel Registration
│   ├── AuthPage.jsx              # Liquid Glass login / sign-up (role selector)
│   └── OrganizerDashboard.jsx    # Event CRUD, stats row, scanner, analytics link
│
└── components/
    ├── shared/
    │   ├── Navbar.jsx            # Top navigation with role-based menu links
    │   ├── ScannerPanel.jsx      # QR token input modal for organizer check-in
    │   └── TicketPass.jsx        # 3D magnetic Apple Wallet-style ticket card
    │                               Physics hover (useSpring + useTransform)
    │                               Cursor-chasing specular glare overlay
    │                               REGISTERED / CHECKED_IN status variants
    └── ui/
        ├── AnimatedCounter.jsx   # useSpring count-up animation
        ├── GlassButton.jsx       # Reusable glass-morphism button
        ├── GlassCard.jsx         # Card with backdrop blur and specular border
        └── GlassInput.jsx        # Icon-prefixed glass-style input field
```

---

## Routing

| Path | Component | Access |
|---|---|---|
| `/auth` | `AuthPage` | Public (redirects if authenticated) |
| `/adminlogin` | `AdminLoginPage` | Public — Admin portal |
| `/` | `HomeRedirect` | Smart redirect based on role |
| `/portal` | `AttendeePortal` | All authenticated users |
| `/dashboard` | `OrganizerDashboard` | ORGANIZER, ADMIN |
| `/analytics` | `AnalyticsDashboard` | ORGANIZER, ADMIN |
| `/admin/dashboard` | `AnalyticsDashboard` | ADMIN only |

All protected routes use the `<ProtectedRoute roles={[...]}>` guard.  
Unauthorized role access redirects to `/portal`.

---

## Authentication Flow

```
User submits login form
  └─► authApi.login({ email, password })
        └─► POST /api/auth/login
              ← { accessToken, userId, name, email, role }
              → Stored in localStorage (eventsphere_token, eventsphere_user)
              → AuthContext sets user + token state
              → App re-renders with new auth state
              → HomeRedirect sends to /dashboard or /portal

On page refresh:
  AuthProvider reads localStorage → sets user + token without API call

On 401 response:
  Axios interceptor → clears localStorage → redirects to /auth
```

---

## Key Pages

### AuthPage (`/auth`)
- Toggle between **Sign In** and **Sign Up** with animated panel transition
- Sign Up includes a role dropdown: `Attendee` or `Organizer`
- Liquid Glass card with specular top border and ambient orbs

### AdminLoginPage (`/adminlogin`)
- Separate styled portal with indigo accent
- Credential hint box showing default credentials
- After login, verifies `user.role === 'ROLE_ADMIN'`; rejects non-admins

### OrganizerDashboard (`/dashboard`)
- Stats row: Total Events · Total Registered · Total Capacity · Almost Full
- Event card grid with edit/delete inline actions
- `+ Create Event` modal
- **Scanner** button opens `ScannerPanel` modal for QR check-in
- **View Analytics** link navigates to `/analytics`

### AttendeePortal (`/portal`)
- **Discover** tab: event grid with live search and capacity bars
- **My Tickets** tab: gallery of `TicketPass` Apple Wallet cards
- Each registered ticket shows a **Cancel Registration** button (red, REGISTERED only)
- After registration, auto-switches to "My Tickets" tab

### AnalyticsDashboard (`/analytics` or `/admin/dashboard`)
- Animated count-up stat cards (AnimatedCounter via useSpring)
- Two SVG ring charts: Fill Rate · Attendance Rate
- Animated horizontal funnel (Capacity → Registered → Checked In)
- Per-event breakdown rows with dual-layer progress bars
- Refresh button with spinning icon animation

### TicketPass (component)
- `300×300` QR code rendered as `<img src="data:image/png;base64,...">`
- 3D hover: `rotateX` / `rotateY` driven by mouse position via `useSpring`
- Cursor-chasing specular glare with `useTransform` + radial gradient
- Perforated divider: notched circles + dashed line (pure CSS)
- CHECKED_IN state: muted green badge

---

## API Service (`api.js`)

```js
// Auth
authApi.register({ name, email, password, role })
authApi.login({ email, password })
authApi.me()

// Events
eventsApi.getAll()
eventsApi.getById(id)
eventsApi.getMyEvents()
eventsApi.create(data)
eventsApi.update(id, data)
eventsApi.delete(id)

// Registrations
registrationsApi.register(eventId)
registrationsApi.myTickets()
registrationsApi.cancel(registrationId)       // DELETE /registrations/{id}
registrationsApi.guestList(eventId)           // GET /registrations/event/{id}/guests

// Check-In
checkInApi.validate(qrToken)

// Analytics
analyticsApi.dashboard()

// Admin
adminApi.getUsers()                           // GET /admin/users
adminApi.getEvents()                          // GET /admin/events
```

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

## Design System

All styling is **vanilla CSS-in-JS** (inline `style` props) with design tokens:

| Token | Value |
|---|---|
| Background | `#050505` |
| Surface | `rgba(255,255,255,0.04)` |
| Border | `rgba(255,255,255,0.08)` |
| Primary text | `#FAFAFA` |
| Secondary text | `#71717A` |
| Muted | `#3f3f46` |
| Success accent | `#34d399` |
| Danger | `#f87171` |
| Admin accent | `#6366f1` (indigo) |
| Backdrop blur | `20–32px` |
| Border radius | `0.75rem` – `1.5rem` |
| Font | Inter, system-ui, sans-serif |
