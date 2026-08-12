# EventSphere — Troubleshooting Notes

> All real issues encountered and resolved during development.  
> Use this file as the first reference before digging through code.

---

## 📋 Table of Contents

1. [403 Forbidden on ALL endpoints](#1-403-forbidden-on-all-endpoints)
2. [JWT WeakKeyException — HS512 key too short](#2-jwt-weakkeyexception--hs512-key-too-short)
3. [Port 8080 / 5173 already in use](#3-port-8080--5173-already-in-use)
4. [Blank / Black screen on frontend](#4-blank--black-screen-on-frontend)
5. [Admin cannot edit or delete events they don't own](#5-admin-cannot-edit-or-delete-events-they-dont-own)
6. [No attendee cancellation endpoint](#6-no-attendee-cancellation-endpoint)
7. [No guest list for organizer](#7-no-guest-list-for-organizer)
8. [No All-Users view for Admin](#8-no-all-users-view-for-admin)
9. [Admin account does not exist on first boot](#9-admin-account-does-not-exist-on-first-boot)
10. [mvnw: Permission denied / not recognised](#10-mvnw-permission-denied--not-recognised)
11. [CORS errors in browser console](#11-cors-errors-in-browser-console)
12. [Single login form breaking role immersion — redesigned to portal selection](#12-single-login-form-breaking-role-immersion)
13. [MySQL connection refused on startup](#13-mysql-connection-refused-on-startup)
14. [QR code not displaying on ticket — blank image area](#14-qr-code-not-displaying-on-ticket--blank-image-area)
15. [Attendee can register for same event twice](#15-attendee-can-register-for-same-event-twice)
16. [JWT token lost on browser refresh](#16-jwt-token-lost-on-browser-refresh)
17. [npm install / Vite build errors — node_modules issues](#17-npm-install--vite-build-errors--node_modules-issues)
18. [Spring Boot fails to start — schema.sql errors](#18-spring-boot-fails-to-start--schemasql-errors)
19. [Organizer sees another organizer's events](#19-organizer-sees-another-organizers-events)
20. [ECharts / echarts-for-react not rendering on first load](#20-echarts--echarts-for-react-not-rendering-on-first-load)

---

## 1. 403 Forbidden on ALL endpoints

**Symptom**  
Every API call — including `POST /api/auth/register` and `POST /api/auth/login` — returns `403 Forbidden`. Sign-up and admin login both fail immediately.

**Root Cause**  
`JwtAuthenticationFilter` was annotated with `@Component`. Spring Boot automatically scans all `@Component` beans that extend `OncePerRequestFilter` and registers them as **raw servlet filters** — they run *before* Spring Security starts. `SecurityConfig.addFilterBefore()` then added the same filter **a second time** inside the security chain.

On the first pass (before security), the `SecurityContext` was empty. The second pass then blocked everything with 403 because no authentication existed yet.

**Fix applied in:** [`SecurityConfig.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/config/SecurityConfig.java)

```java
/**
 * Prevent Spring Boot from auto-registering JwtAuthenticationFilter
 * as a raw Servlet filter. We want it only inside the Spring Security
 * filter chain, not outside it.
 */
@Bean
public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
        JwtAuthenticationFilter filter) {
    FilterRegistrationBean<JwtAuthenticationFilter> reg = new FilterRegistrationBean<>(filter);
    reg.setEnabled(false); // ← disables auto-registration
    return reg;
}
```

Confirm the fix is active by checking the startup log for:
```
Filter jwtFilterRegistration was not registered (disabled)
```

---

## 2. JWT WeakKeyException — HS512 key too short

**Symptom**  
Login returns 403. Backend log shows:
```
WeakKeyException: The signing key's size is 384 bits which is not secure
enough for the HS512 algorithm. Keys used with HS512 MUST have a size >= 512 bits.
```

**Root Causes (two separate bugs)**  
1. The JWT secret in `application.properties` is a **hex string**, but `JwtTokenProvider` was decoding it with `Decoders.BASE64.decode()` — treating a hex string as Base64 produces garbage bytes and far fewer usable bits than expected.  
2. The algorithm was set to `HS512`, which requires a minimum of **512 bits**. The hex secret decoded as UTF-8 gives 504 bits — enough for HS256 but not HS512.

**Fix applied in:** [`JwtTokenProvider.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/security/JwtTokenProvider.java)

```java
// BEFORE (wrong — decodes hex as Base64 → garbage bytes)
byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);

// AFTER (correct — reads hex string as raw UTF-8 bytes → 504 bits)
byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
```

```java
// Algorithm changed from HS512 → HS256 (256-bit minimum, our key is 504 bits)
.signWith(getSigningKey(), SignatureAlgorithm.HS256)
```

> **Note:** If you change the secret in `application.properties`, all previously issued tokens become invalid. All users will need to log in again.

---

## 3. Port 8080 / 5173 already in use

**Symptom**  
Backend fails to start:
```
Web server failed to start. Port 8080 was already in use.
```
Or Vite fails to start with port 5173 already bound.

**Cause**  
An old backend/frontend process was not cleanly stopped — typically after killing the terminal window without pressing `Ctrl+C` first.

**Fix — Kill by port (Windows PowerShell)**

```powershell
# Kill backend (port 8080)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess -Force

# Kill frontend dev server (port 5173)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -Force
```

**Fix — Kill all Java/Node processes**

```powershell
Get-Process java, node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Fix — Find PID manually**

```powershell
netstat -ano | findstr ":8080"
Stop-Process -Id <PID> -Force
```

```bash
# Linux / macOS
kill -9 $(lsof -t -i:8080)
kill -9 $(lsof -t -i:5173)
```

---

## 4. Blank / Black screen on frontend

**Symptom**  
`localhost:5173` shows a completely black/empty page with no content. Browser console shows:
```
ReferenceError: user is not defined  (App.jsx)
```

**Root Cause**  
In `App.jsx`, the `AppRoutes` component only destructured `isAuthenticated` from `useAuth()`, but the `/adminlogin` route element used `user?.role` inline to decide whether to redirect an already-logged-in admin. Since `user` was never declared in the `AppRoutes` scope, JavaScript threw a `ReferenceError` which crashed the entire React component tree on mount.

**Fix applied in:** [`App.jsx`](file:///d:/ANTIGRAVITY/Eventsphere/frontend/src/App.jsx)

```jsx
// BEFORE (bug — user not in scope)
const { isAuthenticated } = useAuth();

// AFTER (fix — user now available for the adminlogin redirect check)
const { isAuthenticated, user } = useAuth();
```

---

## 5. Admin cannot edit or delete events they don't own

**Symptom**  
Admin tries to edit or delete an event created by an Organizer and gets `403 AccessDeniedException`.

**Root Cause**  
`EventService.updateEvent()` and `deleteEvent()` had a hard ownership check:
```java
if (!event.getOrganizer().getEmail().equals(requesterEmail)) {
    throw new AccessDeniedException("You are not the organizer of this event.");
}
```
This check ran for **all** users, including Admins. The RBAC spec says Admins have global override rights.

**Fix applied in:** [`EventService.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/services/EventService.java)

```java
// Added isAdmin() helper that checks SecurityContext
private boolean isAdmin() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    return auth != null && auth.getAuthorities()
            .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
}

// Admin bypasses ownership check
if (!isAdmin() && !event.getOrganizer().getEmail().equals(requesterEmail)) {
    throw new AccessDeniedException("You are not the organizer of this event.");
}
```

---

## 6. No attendee cancellation endpoint

**Symptom**  
Attendees had no way to cancel a registration. The "Cancel Registration" button was missing from the UI and there was no backend endpoint.

**Fix — Backend:** [`RegistrationService.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/services/RegistrationService.java) + [`RegistrationController.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/controllers/RegistrationController.java)

```
DELETE /api/registrations/{id}
```
Guards applied:
- Ownership check (can only cancel your own registration)
- Cannot cancel if status is `CHECKED_IN`
- Cannot cancel if already `CANCELLED`
- Sets status to `CANCELLED` (frees capacity slot)

**Fix — Frontend:** [`AttendeePortal.jsx`](file:///d:/ANTIGRAVITY/Eventsphere/frontend/src/pages/AttendeePortal.jsx)
- Added **Cancel Registration** button (red, visible only for `REGISTERED` tickets)
- `handleCancel()` calls `registrationsApi.cancel(registrationId)`
- Confirms with `window.confirm()` before sending request
- Refreshes ticket list on success

**Fix — API service:** [`api.js`](file:///d:/ANTIGRAVITY/Eventsphere/frontend/src/services/api.js)
```js
registrationsApi.cancel(registrationId)  // DELETE /registrations/{id}
```

---

## 7. No guest list for organizer

**Symptom**  
Organizers had no way to see who had registered for their events.

**Fix — Backend:** New endpoint added to [`RegistrationController.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/controllers/RegistrationController.java)

```
GET /api/registrations/event/{eventId}/guests
```
- `@PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")`
- Organizers can only view guests for events they own
- Admins can view guests for any event
- Returns `List<GuestView>` with attendee name, email, status, registered timestamp

**Fix — API service:** [`api.js`](file:///d:/ANTIGRAVITY/Eventsphere/frontend/src/services/api.js)
```js
registrationsApi.guestList(eventId)  // GET /registrations/event/{id}/guests
```

---

## 8. No All-Users view for Admin

**Symptom**  
The RBAC spec required Admins to see the complete list of all platform users (Organizers + Attendees), but no such endpoint existed.

**Fix — Backend:** New [`AdminController.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/controllers/AdminController.java) created.

```
GET /api/admin/users    → All platform users     [ADMIN only]
GET /api/admin/events   → All events, all orgs   [ADMIN only]
```

Class-level `@PreAuthorize("hasRole('ADMIN')")` ensures only admins reach these endpoints. Also secured at the URL level in `SecurityConfig`:
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

**Fix — API service:** [`api.js`](file:///d:/ANTIGRAVITY/Eventsphere/frontend/src/services/api.js)
```js
adminApi.getUsers()    // GET /admin/users
adminApi.getEvents()   // GET /admin/events
```

---

## 9. Admin account does not exist on first boot

**Symptom**  
Fresh database has no admin account. Login at `/adminlogin` with `admin@eventsphere.com` returns 401 because the user doesn't exist.

**Root Cause**  
An earlier approach used a hardcoded SQL `INSERT` in `schema.sql` with a plaintext password. Spring Security's BCrypt check rejected it because the stored value was not a valid BCrypt hash.

**Fix — Backend:** [`DataSeeder.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/config/DataSeeder.java)

`DataSeeder` implements `ApplicationRunner` and runs once after context startup:
1. Checks if `admin@eventsphere.com` already exists → skips if so (idempotent)
2. Fetches or creates the `ROLE_ADMIN` role
3. Hashes the password with `BCryptPasswordEncoder`
4. Saves the User entity

Default admin credentials seeded on first boot:
```
Email    : admin@eventsphere.com
Password : admin123
```

> ⚠️ Change this password immediately in any staging/production environment.

---

## 10. mvnw: Permission denied / not recognised

**Symptom — Windows**
```
'./mvnw' is not recognized as an internal or external command
```

**Fix**  
On Windows, always use the `.cmd` wrapper:
```powershell
.\mvnw.cmd spring-boot:run
.\mvnw.cmd clean package -DskipTests
```

**Symptom — Linux/macOS**
```bash
bash: ./mvnw: Permission denied
```

**Fix**
```bash
chmod +x mvnw
./mvnw spring-boot:run
```

---

## 11. CORS errors in browser console

**Symptom**  
Frontend at `localhost:5173` gets CORS errors when calling `localhost:8080`. Browser console shows:
```
Access to XMLHttpRequest at 'http://localhost:8080/api/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Root Cause**  
`SecurityConfig` had an empty CORS lambda (`cors -> {}`) which ignores the `CorsConfigurationSource` bean defined in `WebConfig`. The Spring Security CORS integration requires explicitly wiring the bean:

**Fix applied in:** [`SecurityConfig.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/config/SecurityConfig.java)

```java
// BEFORE (broken — ignores the WebConfig CORS bean)
.cors(cors -> {})

// AFTER (correct — explicitly uses the CorsConfigurationSource bean)
.cors(cors -> cors.configurationSource(corsConfigurationSource))
```

`WebConfig.java` allows `http://localhost:5173` for all methods with credentials.

---

## 12. Single login form breaking role immersion

**Symptom / Problem**  
Organizers and Attendees landed on the exact same login/register form at `/login`. The form had a small "I am joining as" pill toggle buried inside the registration step. This caused two issues:
1. **UX immersion broken** — an Organizer opening a "Workspace" and an Attendee opening a "Consumer App" were forced through the same door with no visual distinction.
2. **Registration role error-prone** — users could accidentally register with the wrong role if they didn't notice the small pill toggle.

**Root Cause**  
There was no step to differentiate the user's intent *before* showing credentials. The backend correctly stores the role, but the frontend gave no meaningful context to help the user understand which role they were signing up for.

**Fix applied in:** [`AuthPage.jsx`](file:///d:/ANTIGRAVITY/Eventsphere/frontend/src/pages/AuthPage.jsx)

The page now implements a **3-step portal-selection flow**:

```
Step 1 — Portal Selection
  ┌─────────────────────────────┐
  │  🎫 Attendee Portal         │  → sets role = ROLE_ATTENDEE
  │  🎤 Creator Studio          │  → sets role = ROLE_ORGANIZER
  │  (Admin portal link below)  │  → navigates to /adminlogin
  └─────────────────────────────┘

Step 2 — Login / Register (role-aware)
  ← Back button + coloured portal badge (e.g. 🎫 Attendee Portal)
  Heading and subtext are contextual per portal
  register() always sends the correct role payload
```

**Key UX details:**
- The ambient background orb smoothly animates its tint colour (emerald for Attendee, violet for Organizer) when a portal is chosen, providing instant visual feedback
- `PortalCard` components have per-card accent hover states
- Framer Motion `AnimatePresence mode="wait"` handles the step transition with blur + slide animations
- The glass card height layout-animates automatically via `motion.div layout`
- All existing `useAuth` wiring, `GlassInput`/`GlassButton` components, and post-auth navigation slugs are preserved unchanged

**Login flow is unchanged** — the backend resolves the actual role from the JWT token. Selecting a portal before login is purely UX; if a user already has an account and picks the "wrong" portal card, login succeeds and they are redirected to their correct dashboard anyway.

---

## 13. MySQL connection refused on startup

**Symptom**  
Backend fails to start with:
```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```
or
```
Failed to obtain JDBC Connection; nested exception: java.sql.SQLNonTransientConnectionException
```

**Possible Causes & Fixes**

**Cause A: MySQL service is not running**
```powershell
# Windows — start MySQL service
net start MySQL80
# or from Services panel: services.msc → MySQL80 → Start
```
```bash
# Linux / macOS
sudo systemctl start mysql
# or
brew services start mysql
```

**Cause B: Wrong credentials in `application.properties`**  
Check `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/eventsphere
spring.datasource.username=root
spring.datasource.password=your_actual_password
```
Verify you can connect with those credentials in MySQL Workbench or the CLI.

**Cause C: Database `eventsphere` doesn't exist yet**
```sql
-- Run this in MySQL Workbench / CLI before starting the backend
CREATE DATABASE eventsphere;
```

**Cause D: MySQL is running on a non-default port**  
Update the port in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:YOUR_PORT/eventsphere
```

---

## 14. QR code not displaying on ticket — blank image area

**Symptom**  
Ticket cards in the Attendee Portal show a blank white or grey rectangle where the QR code should be. No console error or a broken image icon.

**Possible Causes & Fixes**

**Cause A: `qrBase64` field is null or empty**  
Call `GET /api/registrations/my-tickets` directly in the browser (with your Bearer token) and check that each ticket object has a non-empty `qrBase64` field. If it's null, the QR generation failed silently on the backend.

Check the backend log for `ZXing` errors:
```
WriterException: ...
```

**Cause B: Corrupt Base64 prefix**  
The frontend renders the QR with:
```jsx
<img src={`data:image/png;base64,${ticket.qrBase64}`} ... />
```
If `ticket.qrBase64` already contains the `data:image/png;base64,` prefix (double-prefix), the image breaks. Check `QRCodeService.java` — it should return **raw** Base64 without the prefix.

**Cause C: Registration was cancelled before ticket rendered**  
Cancelled registrations still appear in the ticket list but with `status: CANCELLED`. The `TicketPass` component dims cancelled tickets. If the QR field is stripped for cancelled tickets by the backend, this is expected behaviour.

**Quick fix — regenerate test data:**  
Cancel and re-register for an event to get a fresh QR ticket.

---

## 15. Attendee can register for same event twice

**Symptom**  
An attendee clicks "Register" again for an event they're already registered for and gets a second ticket instead of an error.

**Root Cause**  
`RegistrationService.register()` was missing a duplicate-registration check.

**Fix applied in:** [`RegistrationService.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/services/RegistrationService.java)

The service now checks for an existing `REGISTERED` or `CHECKED_IN` registration before creating a new one:
```java
boolean alreadyRegistered = registrationRepository
    .findByEventIdAndAttendeeId(eventId, attendee.getId())
    .stream()
    .anyMatch(r -> r.getStatus() == RegistrationStatus.REGISTERED
               || r.getStatus() == RegistrationStatus.CHECKED_IN);

if (alreadyRegistered) {
    throw new IllegalStateException("You are already registered for this event.");
}
```

The frontend shows the server error message inline below the Register button.

---

## 16. JWT token lost on browser refresh

**Symptom**  
After refreshing the page, the user is logged out and sent back to `/login` even though they had just authenticated. The dashboard was accessible before refresh.

**Root Cause**  
The JWT was stored only in React state (`useState`) inside `AuthContext`. React state is ephemeral — it resets on every page refresh.

**Fix applied in:** [`AuthContext.jsx`](file:///d:/ANTIGRAVITY/Eventsphere/frontend/src/context/AuthContext.jsx)

On login/register, the token is persisted to `localStorage`:
```js
localStorage.setItem('token', accessToken);
```

On mount, `AuthContext` rehydrates state from `localStorage`:
```js
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // decode and restore user state from token payload
  }
}, []);
```

On logout, the token is cleared:
```js
localStorage.removeItem('token');
```

---

## 17. npm install / Vite build errors — node_modules issues

**Symptom**  
Running `npm install` or `npm run dev` fails with cryptic errors like:
```
Cannot find module '...'
ENOENT: no such file or directory, open 'node_modules/...'
```
or the dev server starts but shows white-screen import errors.

**Fix — Clean install**
```bash
cd frontend

# Delete existing node_modules and lock file
rm -rf node_modules
rm package-lock.json       # Windows: del package-lock.json

# Fresh install
npm install

# Start dev server
npm run dev
```

**Fix — Clear Vite cache**  
Vite caches pre-bundled dependencies in `node_modules/.vite`. If you're seeing stale module versions:
```bash
rm -rf node_modules/.vite
npm run dev
```

Or use the `--force` flag to bypass cache:
```bash
npx vite --force
```

**If `echarts-for-react` is missing:**
```bash
npm install echarts echarts-for-react
```

---

## 18. Spring Boot fails to start — schema.sql errors

**Symptom**  
Backend throws during startup:
```
org.springframework.jdbc.datasource.init.ScriptStatementFailedException:
Failed to execute SQL script statement ... from class path resource [schema.sql]
```

**Possible Causes & Fixes**

**Cause A: Tables already exist with incompatible definitions**  
`schema.sql` uses `CREATE TABLE IF NOT EXISTS`. If a previous run created tables with a different column structure, the old tables will be silently kept. Drop and recreate:
```sql
DROP DATABASE eventsphere;
CREATE DATABASE eventsphere;
```
Then restart the backend — Hibernate will re-run `schema.sql` from scratch.

**Cause B: `spring.sql.init.mode` is set to `never`**  
Check `application.properties`:
```properties
# Should be 'always' (or remove the line — 'always' is default for embedded DBs)
spring.sql.init.mode=always
```

**Cause C: Hibernate DDL auto setting conflicts with schema.sql**  
```properties
# Use 'none' or 'validate' when schema.sql controls the DDL
spring.jpa.hibernate.ddl-auto=none
```
Setting this to `create` or `create-drop` alongside `schema.sql` can cause conflicts.

---

## 19. Organizer sees another organizer's events

**Symptom**  
An organizer logs in and can see (or edit/delete) events they didn't create.

**Root Cause**  
`GET /api/events/organizer` was using a non-scoped query that returned all events instead of filtering by `organizer_id`.

**Fix applied in:** [`EventRepository.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/repositories/EventRepository.java) + [`EventService.java`](file:///d:/ANTIGRAVITY/Eventsphere/backend/src/main/java/com/eventsphere/services/EventService.java)

The repository query is scoped by organizer email:
```java
List<Event> findByOrganizerEmail(String email);
```

The service resolves the email from `SecurityContextHolder` — so the query is always scoped to the **currently authenticated user**, not a URL parameter that could be spoofed.

For edit/delete, `EventSecurityService` performs an additional ownership check using `@PreAuthorize("@eventSecurityService.isOwner(#id, authentication.name) or hasRole('ADMIN')")`.

---

## 20. ECharts / echarts-for-react not rendering on first load

**Symptom**  
The pie charts in `OrganizerEventDetails.jsx` or `AnalyticsDashboard.jsx` appear as empty boxes on first load. Resizing the browser window makes them appear correctly.

**Root Cause**  
ECharts measures the container's dimensions on mount. If the parent container has `height: 0` or is hidden during the initial render (e.g., inside a tab that's not active, or a card that hasn't finished animating in), ECharts records `0×0` and renders nothing.

**Fix**

Ensure the chart container has an explicit pixel height:
```jsx
<div style={{ height: '240px', width: '100%' }}>
  <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
</div>
```

If the chart is inside a Framer Motion animated container, add `onAnimationComplete` to trigger a resize after the animation finishes:
```jsx
<motion.div
  onAnimationComplete={() => window.dispatchEvent(new Event('resize'))}
>
  ...
</motion.div>
```

Dispatching a `resize` event causes ECharts to recalculate its canvas dimensions.

---

## 🔁 General Restart Checklist

When something is broken after a code change:

```
1. Stop the backend   → Ctrl+C in backend terminal
2. Stop the frontend  → Ctrl+C in frontend terminal
3. Kill stale ports   → see Issue #3 above
4. Clean rebuild      → .\mvnw.cmd clean package -DskipTests
5. Restart backend    → .\mvnw.cmd spring-boot:run
6. Restart frontend   → npm run dev   (in /frontend)
7. Hard refresh browser → Ctrl+Shift+R  (clears Vite cache)
```

> **Tip:** After any Java change, always do `mvnw clean` — Maven's incremental compiler may miss changes to files with the same timestamp and skip recompilation, leading to stale `.class` files being run.

> **Tip:** After any change to `application.properties` (especially the JWT secret), restart the backend AND log out all active sessions — existing tokens will be invalid.
