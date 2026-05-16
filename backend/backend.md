# CoWork Backend API

**Base URL:** `http://localhost:8080` (dev — set via `PORT` in `.env`)
**Auth header:** `Authorization: Bearer <jwt>` for all endpoints marked 🔒
**Content-Type:** `application/json` for all `POST`/`PATCH` requests

---

## Common response shapes

- **Success:** the relevant entity wrapped in a key, e.g. `{ "user": {...} }`, `{ "branches": [...] }`.
- **Error:** `{ "error": "human readable message" }` with appropriate 4xx/5xx status.
- **Auth response:** `{ "token": "<jwt>", "user": {...} }`. Token expires in 7 days (configurable via `JWT_EXPIRES_IN`). Store token client-side and send in every authed request.

---

## Roles

| Role | Scope |
|---|---|
| `superadmin` | Sees / manages everything across all branches |
| `admin` | Scoped to one branch (their `branch` field); manages users / workspaces / bookings within it |
| `user` | Regular member; can browse, book, manage their own profile |

---

## Enums

| Enum | Values |
|---|---|
| Role | `superadmin`, `admin`, `user` |
| WorkspaceType | `hot_desk`, `dedicated_desk`, `focus_pod`, `meeting_room`, `conference_hall`, `private_cabin` |
| WorkspaceStatus | `available`, `occupied`, `maintenance` |
| BookingStatus | `pending`, `confirmed`, `cancelled`, `completed` |
| PlanType | `daily`, `weekly`, `monthly`, `corporate` |
| BranchStatus | `active`, `inactive` |

---

## 🔐 Auth — `/api/auth`

### `POST /api/auth/signup` (public)

Self-registration. Always creates `role: 'user'` (any role in body is ignored).

```json
// Request
{ "name": "Ram Bahadur", "email": "ram@example.com", "password": "min8chars", "phone": "+977..." }

// Response 201
{ "token": "<jwt>", "user": { "_id": "...", "name": "...", "email": "...", "role": "user", "branch": null } }
```

**Errors:** 400 missing fields / weak password (<8 chars), 409 email already in use.

---

### `POST /api/auth/login` (public)

Works for all roles.

```json
// Request
{ "email": "ram@example.com", "password": "min8chars" }

// Response 200
{ "token": "<jwt>", "user": {...} }
```

**Errors:** 400 missing, 401 invalid credentials.

---

### `POST /api/auth/forgot-password` (public)

Always returns 200 (doesn't leak whether email exists). Token printed to server console in dev.

```json
// Request
{ "email": "ram@example.com" }

// Response 200
{ "message": "If that email exists, a reset link has been sent.", "devToken": "<token>" }
// devToken only present when NODE_ENV !== 'production'
```

---

### `POST /api/auth/reset-password` (public)

Token expires 1 hour after request.

```json
// Request
{ "token": "<from forgot-password>", "password": "newPass8" }

// Response 200
{ "message": "Password updated. You can now log in." }
```

**Errors:** 400 invalid/expired token or weak password.

---

### `GET /api/auth/me` 🔒

Returns current user with populated `branch`.

```json
// Response 200
{ "user": { "_id": "...", "name": "...", "role": "...", "branch": { "_id": "...", "name": "..." } } }
```

---

### `POST /api/auth/change-password` 🔒

For logged-in users.

```json
// Request
{ "currentPassword": "oldPass", "newPassword": "newPass8" }

// Response 200
{ "message": "Password updated." }
```

**Errors:** 401 current password wrong, 400 weak new password.

---

## 👥 Users — `/api/users` 🔒

### `GET /api/users` — superadmin, admin

List users. Admin sees only their branch; superadmin sees all.
**Query:** `?role=user|admin|superadmin` (optional filter)

```json
{ "users": [ {...} ] }
```

---

### `GET /api/users/members` — superadmin, admin

Convenience: list users where `role=user`. Admin scoped to their branch.

```json
{ "members": [ {...} ] }
```

---

### `POST /api/users` — superadmin, admin

Admin-side creation (use `/auth/signup` for public). Admin can only create `role=user` in their own branch. Superadmin can create any role.

```json
// Request
{
  "name": "Sita",
  "email": "sita@example.com",
  "password": "min8chars",
  "role": "admin",            // superadmin can set this; admin always 'user'
  "branch": "<branchId>",     // required unless role=superadmin
  "phone": "+977..."
}

// Response 201
{ "user": {...} }
```

---

### `GET /api/users/:id` 🔒

Anyone authed. Admin restricted to their branch.

---

### `PATCH /api/users/:id` 🔒

Self can update own `name`, `phone`. Only superadmin can change `role` or `branch`. Admin can update users in their own branch (not `role`/`branch`).

```json
// Request (any subset)
{ "name": "...", "phone": "...", "isActive": true, "role": "admin", "branch": "<branchId>" }

// Response 200
{ "user": {...} }
```

**Special rules:** cannot demote the last superadmin; promoting to superadmin nulls `branch`.

---

### `DELETE /api/users/:id` — superadmin, admin

Cannot delete yourself. Cannot delete the last superadmin. Admin scoped to own branch.
**Response 204**

---

## 🏢 Branches — `/api/branches` 🔒

### `GET /api/branches`

- superadmin / user → all branches
- admin → only their branch

```json
{
  "branches": [
    {
      "_id": "...",
      "name": "CoWork Downtown",
      "address": "...",
      "city": "...",
      "phone": "...",
      "email": "...",
      "operatingHours": "7 AM - 10 PM",
      "imageUrl": "...",
      "status": "active"
    }
  ]
}
```

---

### `GET /api/branches/:id`

Returns one branch.

---

### `POST /api/branches` — superadmin

```json
// Request
{
  "name": "CoWork Lakeside",
  "address": "Lakeside Road, Pokhara",
  "city": "Pokhara",
  "phone": "+977-1-...",
  "email": "lakeside@cowork.com",
  "operatingHours": "8 AM - 9 PM",
  "imageUrl": "https://...",
  "status": "active"
}

// Response 201
{ "branch": {...} }
```

---

### `PATCH /api/branches/:id` — superadmin, admin (own branch)

Send any subset of fields to update.

---

### `DELETE /api/branches/:id` — superadmin

**Response 204**

---

## 🪑 Workspaces — `/api/workspaces` 🔒

These are bookable spaces inside a branch — Hot Desks, Meeting Rooms, etc.

### `GET /api/workspaces`

**Query:** `?branch=<id>&type=<WorkspaceType>&status=<WorkspaceStatus>`
Admin's results auto-scoped to their branch.

```json
{
  "workspaces": [
    {
      "_id": "...",
      "name": "Horizon Hot Desk A",
      "branch": { "_id": "...", "name": "CoWork Downtown" },
      "type": "hot_desk",
      "capacity": 1,
      "floor": "2",
      "status": "available",
      "pricePerHour": 5,
      "pricePerDay": 40,
      "pricePerMonth": 600,
      "description": "...",
      "imageUrl": "..."
    }
  ]
}
```

---

### `GET /api/workspaces/:id`

Returns one workspace with populated `branch`.

---

### `POST /api/workspaces` — superadmin, admin

Admin's branch is forced to their own (any `branch` in body is ignored).

```json
// Request
{
  "name": "Focus Pod B3",
  "branch": "<branchId>",       // required for superadmin; ignored for admin
  "type": "focus_pod",
  "capacity": 2,
  "floor": "1",
  "status": "available",
  "pricePerHour": 15,
  "pricePerDay": 100,
  "pricePerMonth": 1500,
  "description": "...",
  "imageUrl": "https://..."
}

// Response 201
{ "workspace": {...} }
```

---

### `PATCH /api/workspaces/:id` — superadmin, admin (own branch)

Send any subset. `branch` field cannot be changed via PATCH.

---

### `DELETE /api/workspaces/:id` — superadmin, admin (own branch)

**Response 204**

---

## 💳 Plans — `/api/plans` 🔒

### `GET /api/plans`

Public to all authed users.

```json
{
  "plans": [
    {
      "_id": "...",
      "name": "Day Explorer",
      "type": "daily",
      "price": 15,
      "durationDays": 1,
      "maxBookingsPerMonth": 0,
      "meetingRoomHours": 0,
      "features": ["Hot desk access", "High-speed WiFi", "Coffee & tea"],
      "isActive": true
    }
  ]
}
```

---

### `GET /api/plans/:id`

### `POST /api/plans` — superadmin

```json
// Request
{
  "name": "Pro Monthly",
  "type": "monthly",            // daily | weekly | monthly | corporate
  "price": 199,
  "durationDays": 30,
  "maxBookingsPerMonth": 0,     // 0 = unlimited
  "meetingRoomHours": 8,
  "features": ["Dedicated desk", "Unlimited coffee", "Locker access"],
  "isActive": true
}

// Response 201
{ "plan": {...} }
```

### `PATCH /api/plans/:id` — superadmin

### `DELETE /api/plans/:id` — superadmin

---

## 📅 Bookings — `/api/bookings` 🔒

### `GET /api/bookings`

Scoping is automatic by role:

- **user** → only their own bookings
- **admin** → all bookings in their branch
- **superadmin** → all bookings everywhere

**Query:** `?status=pending|confirmed|cancelled|completed`

```json
{
  "bookings": [
    {
      "_id": "...",
      "user": { "_id": "...", "name": "Thesis Sathi", "email": "sathi@..." },
      "workspace": { "_id": "...", "name": "Horizon Hot Desk A", "type": "hot_desk" },
      "branch": { "_id": "...", "name": "CoWork Downtown" },
      "date": "2026-05-09T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "17:00",
      "amount": 40,
      "status": "confirmed",
      "notes": ""
    }
  ]
}
```

---

### `POST /api/bookings` 🔒 (any authed user)

Server fills in `user` (from JWT) and `branch` (from workspace).

```json
// Request
{
  "workspace": "<workspaceId>",
  "date": "2026-05-09",
  "startTime": "09:00",
  "endTime": "17:00",
  "amount": 40,
  "notes": ""
}

// Response 201
{ "booking": {...} }   // status defaults to "pending"
```

---

### `PATCH /api/bookings/:id/status` — superadmin, admin (own branch)

For confirming/cancelling.

```json
// Request
{ "status": "confirmed" }   // pending | confirmed | cancelled | completed

// Response 200
{ "booking": {...} }
```

---

### `DELETE /api/bookings/:id` 🔒

- **user** → can delete only their own
- **admin** → can delete any in their branch
- **superadmin** → can delete any

**Response 204**

---

## Frontend integration notes

- **Token storage** — store JWT in `localStorage` (simpler) or httpOnly cookie (more secure, requires CORS/credentials setup on backend). Send via `Authorization: Bearer <token>` header.
- **Token expiry** — 7 days. On any 401 response, redirect to login.
- **Conditional UI by role** — call `GET /api/auth/me` after login, store `user.role`, hide/show admin pages based on it. Don't trust the frontend role check alone — backend already enforces it.
- **CORS** — not yet enabled on backend. If your frontend runs on a different port (e.g. Vite on 5173), let the backend team know to add the `cors` middleware.
- **Error handling** — all errors return `{ "error": "message" }` with a 4xx/5xx status; show error to the user.
- **Date/time fields on Booking** — `date` is a full ISO date, `startTime`/`endTime` are plain `"HH:mm"` strings.
- **Dev workflow** — backend dev server at `http://localhost:8080`, hot-reloads on file save (`npm run dev`).
