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
