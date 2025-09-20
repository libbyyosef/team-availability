# MyWorkStatus – Team Availability

A lightweight app to view teammates’ statuses, update your own, search by name, filter by multiple statuses, sort (by name or status), display current time, and log out.

- **Login** – authenticate and enter the dashboard  
- **Statuses** – `working` / `on_vacation` / `business_trip` / `remote`  
- **Search & Filter** – by name and multiple statuses  
- **Sort** – by name or status  
- **Time** – shows the current time  
- **Logout** – end your session safely

---

## Demo Accounts (local/dev)

> Emails are **case-sensitive** (DB enforces that).  
> Seeded automatically by `server/scripts/create_db.py` on container startup.

- libby.yosef@pubplus.com — **Libby123!?**
- avi.cohen@pubplus.com — **Avi123!?**
- danny.rodin@pubplus.com — **Danny123!?**
- diana.tesler@pubplus.com — **Diana123!?**
- dolev.aufleger@pubplus.com — **Dolev123!?**
- efi.shmidt@pubplus.com — **Efi123!?**
- inbal.goldfarb@pubplus.com — **Inbal123!?**

Seeded display names + statuses:

| ID | First Name | Last Name  | Email                        | Status          |
|----|------------|------------|------------------------------|-----------------|
| 1  | Libby      | Yosef      | libby.yosef@pubplus.com      | Working         |
| 2  | Avi        | Cohen      | avi.cohen@pubplus.com        | Working         |
| 3  | Diana      | Tesler     | diana.tesler@pubplus.com     | OnVacation     |
| 4  | Yossi      | Morris     | yossi.morris@pubplus.com     | Working         |
| 5  | Danny      | Rodin      | danny.rodin@pubplus.com      | BusinessTrip   |
| 6  | Efi        | Shmidt     | efi.shmidt@pubplus.com       | OnVacation     |
| 7  | Inbal      | Goldfarb   | inbal.goldfarb@pubplus.com   | Working         |
| 8  | Dolev      | Aufleger   | dolev.aufleger@pubplus.com   | Working         |

---


## Local Development (without Docker)

This runs the stack directly on your machine.

### 1) Backend (FastAPI)

```bash
# from repo root
cd server
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set DB URL for local Postgres
export DATABASE_URL="postgresql+psycopg://app:app@localhost:5432/app"
# Windows PowerShell:
# $env:DATABASE_URL = "postgresql+psycopg://app:app@localhost:5432/app"

# Create schema + seed users (once) — run from repo root as a module
cd ..
python -m server.scripts.create_db -s server/sql_db/schema.sql

# Start the API
cd server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Docs (if enabled): http://localhost:8000/docs

> Leave the backend terminal running.

### 2) Frontend (React + Vite)

Open a **new terminal**:

```bash
cd team-availability/client
npm install
# If your API host/port differ:
# echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

- Web UI: http://localhost:5173

---

## API (brief)

- `POST /auth/login` – body `{ email, password }` → sets session / returns user  
- `GET  /users/list_users_with_statuses` – returns users + statuses  
- `POST /users/update_status` – body `{ status }` (auth required)  

> The UI calls `/auth/login` on submit and then pre-warms cookies by calling `/users/list_users_with_statuses` with `credentials: "include"`.

---

## Environment Variables

**Backend** (used by server and Docker):

- `DATABASE_URL` – SQLAlchemy/psycopg URL, e.g.  
  `postgresql+psycopg://app:app@db:5432/app` (inside compose)  
  `postgresql+psycopg://app:app@localhost:5432/app` (local)
- Optional: `UVICORN_PORT` (defaults to 8000), `UVICORN_HOST` (defaults to 0.0.0.0)

**Frontend**:

- `VITE_API_URL` – e.g. `http://localhost:8000` for local dev.

**docker-compose** (defaults):

```env
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_DB=app
DB_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=8080
DATABASE_URL=postgresql+psycopg://app:app@db:5432/app
VITE_API_URL=http://localhost:8000
```

---

## Project Structure (key parts)

```
repo/
├─ docker-compose.yml
├─ .env                         # env for compose (optional)
├─ server/
│  ├─ Dockerfile
│  ├─ entrypoint.sh
│  ├─ requirements.txt
│  ├─ main.py                   # FastAPI entry (app)
│  ├─ scripts/
│  │  └─ create_db.py           # applies schema + seeds demo users/statuses
│  ├─ sql_db/
│  │  ├─ db.py                  # engine / SessionLocal (reads DATABASE_URL)
│  │  ├─ schema.sql             # USERS + USER_STATUSES tables (+ indexes)
│  │  └─ __init__.py
│  ├─ models/
│  │  ├─ user.py                # class User
│  │  ├─ user_status.py         # class UserStatus
│  │  └─ __init__.py
│  └─ routers/ crud/ schemas/ ...
└─ client/
   ├─ Dockerfile
   ├─ package.json
   ├─ src/
   └─ ...
```

---

## Troubleshooting

- **Cannot import `sql_db` / `models` when seeding**  
  Always run the seeder **as a module** from repo root:  
  `python -m server.scripts.create_db -s server/sql_db/schema.sql`

- **DB connection refused**  
  Ensure Postgres is running and reachable:  
  `pg_isready -h localhost -p 5432`

- **Login fails**  
  Emails are **case-sensitive**; use the exact addresses listed above.


---

## Tech Stack

### Frontend
- React + Vite + TypeScript
- Chakra UI
- Jotai (state)
- Vitest + Testing Library (jsdom)

### Backend
- FastAPI
- SQLAlchemy 2.x + Psycopg
- Pydantic

### Infra
- PostgreSQL
- Docker & docker-compose


## Quick Start with Docker

> Requires **Docker** and **docker-compose** (or `docker compose`).

```bash
git clone https://github.com/libbyyosef/team-availability.git
cd team-availability
docker-compose up --build
```

- **Web UI** → http://localhost:8080  
- **API** → http://localhost:8000  
- **DB** → localhost:5432 (service name inside compose: `db`)

To stop & clean volumes:

```bash
docker-compose down -v
```

### What the stack does on startup

1. **PostgreSQL** container starts and becomes healthy.  
2. **Backend** waits for DB, then runs:
   - `python server/scripts/create_db.py -s server/sql_db/schema.sql`  
     (Creates tables, seeds the demo users + statuses, idempotent.)
3. **Backend** launches FastAPI (Uvicorn) on port 8000.  
4. **Frontend** is built and served by Nginx on port 8080.

---