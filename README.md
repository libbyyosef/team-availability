# Team Availability

A lightweight app to view teammates’ statuses, update your own, search by name, filter by multiple statuses, sort (by name or status), display current time, and log out.

- **Login** – authenticate and enter the dashboard  
- **Statuses** – working / on_vacation / business_trip / remote  
- **Search & Filter** – by name and multiple statuses  
- **Sort** – by name or status  
- **Time** – shows the current time  
- **Logout** – end your session safely

---

## Quick Start with Docker

> Requires **Docker** and classic **docker-compose**.

```bash
git clone https://github.com/libbyyosef/team-availability.git
cd team-availability
docker-compose up --build
```

- **Web UI** → http://localhost:8080  
- **API** → http://localhost:8000

### Stop & clean

```bash
# Stop: Ctrl+C in the compose terminal
docker-compose down -v
```

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