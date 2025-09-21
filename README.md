# MyWorkStatus – Team Availability

A lightweight app to view teammates’ statuses, update your own, search by name, filter by multiple statuses, sort (by name or status), display the current time (🕒 **clock added**), and log out.  
UI uses **Pubplus color palette**.

- **Login** – authenticate and enter the dashboard  
- **Statuses** – `Working` / `Working Remotely` / `On Vacation` / `Business Trip`  
- **Search & Filter** – by name and multiple statuses  
- **Sort** – by name or status  
- **Time** – shows the current time (top-right clock)  
- **Logout** – end your session safely

---

## Quick Start (Docker only)

> Prerequisites: Docker + docker compose.

```bash
git clone https://github.com/libbyyosef/team-availability.git
cd team-availability
docker-compose up --build
```

- **Web UI** → http://localhost:8080  
- **API** → http://localhost:8000 (also proxied via `/api` from the frontend)  
- **DB** → internal service `db` (PostgreSQL 16)

To stop **and remove volumes** (clean slate):

```bash
docker-compose down -v
```

---

## Demo Accounts

> Emails are **case-sensitive**. Seeded automatically on first startup.

- libby.yosef@pubplus.com — **Libby123!?**  
- avi.cohen@pubplus.com — **Avi123!?**  
- danny.rodin@pubplus.com — **Danny123!?**  
- diana.tesler@pubplus.com — **Diana123!?**  
- dolev.aufleger@pubplus.com — **Dolev123!?**  
- efi.shmidt@pubplus.com — **Efi123!?**  
- inbal.goldfarb@pubplus.com — **Inbal123!?**

| ID | First | Last     | Email                        | Status        |
|----|------:|----------|------------------------------|---------------|
| 1  | Libby | Yosef    | libby.yosef@pubplus.com      | Working       |
| 2  | Avi   | Cohen    | avi.cohen@pubplus.com        | Working       |
| 3  | Diana | Tesler   | diana.tesler@pubplus.com     | On Vacation   |
| 4  | Yossi | Morris   | yossi.morris@pubplus.com     | Working       |
| 5  | Danny | Rodin    | danny.rodin@pubplus.com      | Business Trip |
| 6  | Efi   | Shmidt   | efi.shmidt@pubplus.com       | On Vacation   |
| 7  | Inbal | Goldfarb | inbal.goldfarb@pubplus.com   | Working       |
| 8  | Dolev | Aufleger | dolev.aufleger@pubplus.com   | Working       |

---

## Tech Stack

**Frontend**
- React (Vite, TypeScript)
- Chakra UI (v2) styled with **Pubplus colors**
- Jotai (state)

**Backend**
- FastAPI (Uvicorn)
- SQLAlchemy 2 + Psycopg
- Pydantic

**Infra**
- PostgreSQL 16
- Nginx (serves SPA, proxies `/api` → backend)
- Docker + docker compose

---

## Project Structure (key parts)

```
team-availability/
├─ docker-compose.yml
├─ README.md
├─ client/
│  ├─ Dockerfile
│  ├─ nginx.conf
│  ├─ .env
│  ├─ index.html
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ public/
│  ├─ src/
│  │  ├─ assets/
│  │  │  ├─ styles/
│  │  │  │  └─ styles.ts
│  │  │  └─ types/
│  │  │     └─ types.ts
│  │  ├─ components/
│  │  │  ├─ login/
│  │  │  │  ├─ components/
│  │  │  │  │  └─ LoginComponent.tsx
│  │  │  │  └─ container/
│  │  │  │     └─ LoginContainer.tsx
│  │  │  └─ statuses/
│  │  │     ├─ components/
│  │  │     │  └─ StatusComponent.tsx
│  │  │     └─ container/
│  │  │        └─ StatusContainer.tsx
│  │  ├─ config/
│  │  │  └─ env.ts
│  │  ├─ store/
│  │  ├─ App.tsx
│  │  ├─ App.css
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  └─ vite-env.d.ts
│  ├─ dist/                 # built SPA (created by Docker/Vite)
│  └─ node_modules/         # (local dev)
└─ server/
   ├─ Dockerfile
   ├─ requirements.txt
   ├─ .env
   ├─ main.py               # FastAPI entrypoint
   ├─ api_responses/
   ├─ config/
   ├─ crud/
   │  ├─ cookies.py
   │  ├─ hashing.py
   │  ├─ user_crud.py
   │  ├─ user_status_crud.py
   │  └─ __init__.py
   ├─ models/
   │  ├─ user_model.py
   │  ├─ user_status_model.py
   │  └─ __init__.py
   ├─ routers/
   │  ├─ auth.py
   │  ├─ deps.py
   │  ├─ responses.py
   │  ├─ user_api.py
   │  ├─ user_status_api.py
   │  └─ __init__.py
   ├─ schemas/
   │  ├─ base.py
   │  ├─ user_schema.py
   │  ├─ user_statuses_schema.py
   │  └─ __init__.py
   ├─ scripts/
   │  └─ create_db.py       # applies schema + seeds demo data
   └─ sql_db/
      ├─ schema.sql
      ├─ db.py              # SQLAlchemy engine / SessionLocal
      └─ __init__.py
```

---

