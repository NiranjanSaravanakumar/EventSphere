# EventSphere — Frontend

React 19 + Vite 8 frontend for the EventSphere platform, built with a premium **Liquid Glass** design system.

---

## Tech Stack

| | |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Language | JavaScript (JSX) — no TypeScript |
| Animations | Framer Motion 13 |
| Icons | Lucide React |
| HTTP | Axios |
| Routing | React Router DOM v7 |
| Styles | Vanilla CSS (inline `style` props) — no Tailwind dependency |

---

## Prerequisites

- **Node.js 20+** — [Download](https://nodejs.org/)
- **npm 10+** (bundled with Node)
- EventSphere backend running on `http://localhost:8080`

---

## Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Start development server (hot-reload)
npm run dev
```

App runs at **http://localhost:5173** with a built-in proxy that forwards `/api` requests to the backend.

---

## Environment Variables

Create a `.env` file in this directory (already provided — **do not commit**):

```env
# Local development
VITE_API_BASE_URL=http://localhost:8080/api
```

For production, `.env.production` is used automatically by Vite during `npm run build`:

```env
# Production (Render backend)
VITE_API_BASE_URL=https://eventsphere-api.onrender.com/api
```

> All `VITE_` prefixed variables are embedded at build time by Vite.

---

## Production Build

```bash
npm run build
# Output: dist/
```

Preview the built output locally:

```bash
npm run preview
```

---

## Project Structure

```
src/
├── App.jsx                       # Root router + role-based route guards
├── main.jsx                      # React DOM entry point
│
├── assets/
│   └── index.css                 # Global styles, @keyframes spin, font imports
│
├── context/
│   └── AuthContext.jsx           # JWT state (login/register/logout/rehydrate)
│
├── services/
│   └── api.js                    # Axios instance with JWT interceptor + 401 handler
│
├── pages/
│   ├── AuthPage.jsx              # Liquid Glass login / register
│   ├── OrganizerDashboard.jsx    # Event management for organizers
│   ├── AttendeePortal.jsx        # Event discovery + My Tickets
│   └── AnalyticsDashboard.jsx    # Animated stats + charts
│
└── components/
    ├── shared/
    │   ├── Navbar.jsx            # Sticky glass navigation bar
    │   ├── TicketPass.jsx        # Apple Wallet-style QR ticket card
    │   └── ScannerPanel.jsx      # Organizer QR check-in validator
    └── ui/
        ├── GlassButton.jsx       # Primary / ghost button with spring animation
        ├── GlassInput.jsx        # Floating label input with focus glow
        ├── GlassCard.jsx         # Base glass card with tilt + specular
        └── AnimatedCounter.jsx   # Framer Motion spring count-up
```

---

## Pages & Routing

| Route | Component | Access |
|---|---|---|
| `/auth` | `AuthPage` | Public (redirects away if logged in) |
| `/dashboard` | `OrganizerDashboard` | ORGANIZER, ADMIN |
| `/analytics` | `AnalyticsDashboard` | ORGANIZER, ADMIN |
| `/portal` | `AttendeePortal` | All authenticated users |
| `/*` | `HomeRedirect` | Smart redirect based on role |

**Role → Default Route:**
- `ROLE_ORGANIZER` / `ROLE_ADMIN` → `/dashboard`
- `ROLE_ATTENDEE` → `/portal`

---

## Design System — Liquid Glass

All components use **inline `style` props** (no Tailwind class dependency) built around these principles:

| Token | Value | Usage |
|---|---|---|
| Background | `#050505` | Page backgrounds |
| Foreground | `#FAFAFA` | Primary text |
| Muted | `#71717A` | Secondary text, icons |
| Subtle | `#D4D4D8` | Tertiary text |
| Glass surface | `rgba(255,255,255,0.04)` | Card backgrounds |
| Glass border | `rgba(255,255,255,0.08)` | Card borders |
| Backdrop blur | `blur(32px)` | Glass effect |
| Specular top | `linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)` | Top edge glow |

**Animation patterns:**
```js
// Standard spring — used across all interactive elements
const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

// Staggered entrance — used for card grids
const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } }
}

// Card entrance — blur-in from below
const cardVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)' }
}
```

---

## Key Components

### `TicketPass.jsx`
3D magnetic hover Wallet Pass with Apple-style perforated divider.

```jsx
<TicketPass
  eventName="VisionOS Summit"
  date="Oct 15, 2026"
  time="09:00 AM"
  location="Cupertino, CA"
  attendeeName="John Doe"
  qrBase64="data:image/png;base64,..."   // from /my-tickets API
  qrToken="ES-42-A3F9CC..."
  status="REGISTERED"                    // or "CHECKED_IN"
/>
```

**Effects:**
- `useSpring` tilt (±7°) tracking cursor position
- `useTransform` radial-gradient glare chasing cursor
- `CHECKED_IN` renders green border + badge + "Already Scanned" label

### `AnimatedCounter.jsx`
Spring-eased count-up from 0 to any value:

```jsx
<AnimatedCounter value={4850} />               // → 4,850
<AnimatedCounter value={86.8} suffix="%" decimals={1} />  // → 86.8%
```

### `ScannerPanel.jsx`
Modal for organizers to validate a QR token against the backend:

```jsx
<ScannerPanel onClose={() => setScannerOpen(false)} />
```

Calls `POST /api/check-in { qrToken }` and displays:
- ✅ Attendee name + event name on success
- ❌ Error message (invalid token / already used / cancelled)
- "Scan Another" reset button

---

## Authentication Flow

```
1. User submits login form
   └─► POST /api/auth/login
       ← { accessToken, userId, name, email, role }

2. AuthContext stores token in localStorage
   └─► All Axios requests get: Authorization: Bearer <token>

3. On page refresh:
   └─► AuthContext reads localStorage → rehydrates user state
       (no round-trip needed)

4. 401 response from any endpoint:
   └─► Axios interceptor clears localStorage → redirects to /auth
```

---

## Vite Proxy Config

`vite.config.js` proxies `/api` → backend in dev mode so there are no CORS issues during local development:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

In production, the frontend calls `VITE_API_BASE_URL` directly (CORS is configured on the Spring Boot side).

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com/new)
3. **Root Directory:** `frontend`
4. **Framework Preset:** Vite (auto-detected)
5. **Environment Variable:** `VITE_API_BASE_URL` = your Render backend URL
6. Deploy — Vercel handles the build and CDN distribution automatically
