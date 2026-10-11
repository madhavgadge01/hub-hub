# Hub&Hub Local Setup & Development Guide

## Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher (with workspaces support)
- **Docker & Docker Compose**: For local PostgreSQL and Redis services (or cloud instances)

---

## 1. Quickstart

### 1.1 Clone & Install Dependencies
```bash
# Clone the repository
cd hub-hub

# Install all monorepo workspace dependencies
npm install
```

### 1.2 Configure Environment
Copy the example environment template:
```bash
cp .env.example .env
cp .env.example apps/backend/.env
```

Review `.env` settings:
- **`DB_URL`**: `postgresql://hubhub:hubhub_secret_dev_password@localhost:5432/hubhub_dev` (or Neon connection string)
- **`REDIS_URL`**: `redis://localhost:6379`
- **`ACCESS_TOKEN_SECRET`**: Strong secret string (min. 12 characters)
- **`REFRESH_TOKEN_SECRET`**: Strong secret string (min. 12 characters)

---

## 2. Start Supporting Services with Docker

Start PostgreSQL and Redis in the background:
```bash
docker compose up -d
```

Verify service health:
```bash
docker compose ps
```

---

## 3. Database Migrations

Run database migrations to apply the initial schema and index optimizations:
```bash
npm run migrate
```
The migration runner checks the `schema_migrations` tracking table and safely executes all pending `.sql` files inside transactions without dropping or resetting existing user data.

---

## 4. Run Automated Tests

Execute the complete automated test suite (Unit & Integration tests):
```bash
npm test
```

---

## 5. Development Servers

### Run Both Backend & Frontend Simultaneously:
```bash
npm run dev
```

### Or Run Applications Separately:
```bash
# Terminal 1: Backend API Gateway (http://localhost:8000)
npm run dev:backend

# Terminal 2: React Frontend (http://localhost:5173)
npm run dev:frontend
```

---

## 6. Production Builds

Compile production assets for the frontend:
```bash
npm run build:frontend
```
Build outputs are located in `apps/frontend/dist/`.
