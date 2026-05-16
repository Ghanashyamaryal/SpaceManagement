
# CoWork — Space Management System

A monorepo for the CoWork coworking-space management platform.
- **backend/** — Node.js + Express + MongoDB REST API (TypeScript)
- **frontend/** — React + Vite client (TypeScript)

---

## Tech stack

| Layer | Stack |
|---|---|
| Backend | Node.js, Express 5, TypeScript, Mongoose, JWT auth, bcrypt |
| Frontend | React, Vite, TypeScript |
| Database | MongoDB (local or Atlas) |
| Auth | JWT (Bearer tokens, 7-day expiry) |

---

## Repository structure

```
Space-management-system/
├── backend/              # Express API server
│   ├── src/
│   ├── package.json
│   └── backend.md        # Full API reference
├── frontend/             # React client
│   ├── src/
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- **MongoDB** running locally on `mongodb://localhost:27017` (or a MongoDB Atlas connection string)

---

## Quick start

Clone and install both apps:

```bash
git clone https://github.com/DevNova-Tech/Space-management-system.git
cd Space-management-system

# Backend
cd backend
cp .env.example .env       # then edit values
npm install
npm run seed               # creates the initial superadmin
npm run dev                # starts API on http://localhost:8080

# Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev                # starts client on http://localhost:5173
```

---

## Environment variables

Create `backend/.env` from `.env.example`:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/spacemanagement
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d

SUPERADMIN_EMAIL=superadmin@example.com
SUPERADMIN_PASSWORD=changeme123
SUPERADMIN_NAME=Super Admin
```

The seed script reads these values to create the initial superadmin account.

If your frontend needs a different API base URL, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## Scripts

### Backend (`backend/`)

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run seed` | Create initial superadmin user |

### Frontend (`frontend/`)

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

---

## API documentation

See [backend/backend.md](backend/backend.md) for the full API reference — endpoints, request/response shapes, auth rules, and role scoping.

**Quick reference:**
- Base URL: `http://localhost:8080`
- Auth header: `Authorization: Bearer <jwt>`
- Roles: `superadmin`, `admin`, `user`

---

## Roles & access

| Role | Scope |
|---|---|
| `superadmin` | Full access across all branches |
| `admin` | Scoped to one branch — manages its users, workspaces, bookings |
| `user` | Browses workspaces, creates and manages own bookings |

---

## Development workflow

1. Create a feature branch from `main`: `git switch -c feat-your-feature`
2. Make changes in `backend/` and/or `frontend/`
3. Test locally — both servers should run cleanly
4. Commit, push, open a PR against `main`

---

## Deployment

- **Backend** — build with `npm run build`, run `npm start`. Set environment variables on your host (Railway, Render, Fly, etc.). MongoDB Atlas recommended for prod.
- **Frontend** — `npm run build` produces a static `dist/` folder deployable to Vercel, Netlify, or any static host. Point `VITE_API_BASE_URL` at the deployed API.

---

## Contributing

Internal project — open a PR and request review from a teammate.

---

## License

Proprietary — © DevNova-Tech
ture

