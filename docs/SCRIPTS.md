# Innovation Lab - Start/Stop Scripts Documentation

## Overview

The Innovation Lab platform includes automated scripts to manage all services (web app, API, database, Redis, MinIO, and Mailhog).

## Scripts

### `./start.sh` - Start All Services

**What it does:**

1. ✅ Checks if Docker is running
2. ✅ Starts Docker services (PostgreSQL, Redis, MinIO, Mailhog)
3. ✅ Waits for PostgreSQL and Redis to be ready
4. ✅ Runs database migrations
5. ✅ Starts the web application (Next.js on port 3000)
6. ✅ Starts the API server (NestJS on port 3001)
7. ✅ Opens browser to http://localhost:3000

**Usage:**

```bash
./start.sh
```

**Services Started:**

- 🌐 Web Application: http://localhost:3000
- 🔧 Backend API: http://localhost:3001
- 🏥 API Health: http://localhost:3001/health
- 📚 API Docs: http://localhost:3001/api/docs
- 🗄️ PostgreSQL: localhost:5432
- ⚡ Redis: localhost:6379
- 📦 MinIO Console: http://localhost:9001
- 📧 Mailhog UI: http://localhost:8025

---

### `./stop.sh` - Stop All Services & Clear Ports

**What it does:**

1. ✅ Stops all Node.js development servers (pnpm, next, nest, turbo)
2. ✅ Kills processes on port 3000 (Web Application)
3. ✅ Kills processes on port 3001 (API Server)
4. ✅ Stops all Docker containers (PostgreSQL, Redis, MinIO, Mailhog)
5. ✅ Verifies all ports are cleared

**Usage:**

```bash
./stop.sh
```

**Processes Stopped:**

- pnpm dev (monorepo dev runner)
- next dev (Next.js web app)
- nest start (NestJS API)
- turbo run dev (Turborepo build system)

**Ports Cleared:**

- 3000 (Web Application)
- 3001 (API Server)
- 5432 (PostgreSQL)
- 6379 (Redis)
- 9000/9001 (MinIO)
- 1025/8025 (Mailhog)

---

## Common Workflows

### Fresh Start

```bash
./stop.sh   # Stop everything and clear ports
./start.sh  # Start everything fresh
```

### Quick Restart

```bash
# Press Ctrl+C in the terminal running start.sh
./start.sh  # Start again
```

### Manual Port Cleanup

If ports are stuck after crashes:

```bash
# Kill specific port
lsof -ti :3000 | xargs kill -9

# Or use stop.sh which handles all ports
./stop.sh
```

---

## Troubleshooting

### Port Already in Use

**Problem:** `Port 3000 is in use` or `Port 3001 is in use`

**Solution:**

```bash
./stop.sh  # This will kill all processes and clear ports
./start.sh
```

### Docker Not Running

**Problem:** `Docker is not running`

**Solution:**

1. Open Docker Desktop application
2. Wait for Docker to start
3. Run `./start.sh` again

### Database Migration Errors

**Problem:** Migration fails

**Solution:**

```bash
./stop.sh
docker compose down -v  # Remove volumes
./start.sh
```

### API Won't Start

**Problem:** API crashes or won't respond

**Solution:**

```bash
./stop.sh
# Check logs in the terminal
./start.sh
```

---

## Environment Variables

The scripts use environment variables from:

- `.env` (main environment file)
- `.env.local` (local overrides, git-ignored)

**Key Variables:**

- `API_PORT=3001` - API server port
- `NEXT_PUBLIC_API_URL=http://localhost:3001/v1` - API URL for frontend
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

---

## File Locations

```
Innovation-Lab/
├── start.sh              # Start script
├── stop.sh               # Stop script
├── .env                  # Environment variables
├── docker-compose.yml    # Docker services config
├── apps/
│   ├── web/             # Next.js frontend (port 3000)
│   └── api/             # NestJS backend (port 3001)
└── packages/
    └── database/        # Prisma database package
```

---

## Advanced Usage

### Run Individual Services

**Only Docker services:**

```bash
docker compose up -d
```

**Only web app:**

```bash
cd apps/web
pnpm dev
```

**Only API:**

```bash
cd apps/api
pnpm dev
```

### View Logs

**All services:**

```bash
./start.sh  # Logs will stream in terminal
```

**Docker services only:**

```bash
docker compose logs -f
```

**Specific service:**

```bash
docker compose logs -f postgres
docker compose logs -f redis
```

---

## Notes

- The scripts are designed to be idempotent (safe to run multiple times)
- Stopping services with Ctrl+C in the terminal is safe
- Use `./stop.sh` for complete cleanup including port clearing
- Scripts work on macOS and Linux (may need adjustments for Windows)
