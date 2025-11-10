# 🚀 Quick Start Guide

Get the Innovation Lab platform running on your machine in **less than 5 minutes**.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** ≥ 20.0.0 ([Download](https://nodejs.org/))
- ✅ **pnpm** ≥ 8.0.0 (Install: `npm install -g pnpm`)
- ✅ **Docker Desktop** installed and **running** ([Download](https://www.docker.com/products/docker-desktop))
- ✅ **Git** installed

---

## Installation (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/mickelsamuel/Innovation-Lab.git
cd Innovation-Lab
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the entire monorepo (~2-3 minutes).

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env
```

**Note**: The default values in `.env` are perfectly configured for local development. No changes needed!

###Step 4: Start Everything

```bash
./start.sh
```

This single command will:

1. ✅ Check if Docker is running
2. ✅ Start PostgreSQL, Redis, MinIO, and Mailhog containers
3. ✅ Wait for all services to become healthy
4. ✅ Run database migrations automatically
5. ✅ Ask if you want to seed demo data (recommended: **yes**)
6. ✅ Start the backend API on port 4000
7. ✅ Start the frontend web app on port 3000
8. ✅ Open your browser to http://localhost:3000

**That's it!** Your development environment is ready.

---

## Access Points

Once started, access these services:

| Service              | URL                            | Purpose                                         |
| -------------------- | ------------------------------ | ----------------------------------------------- |
| 🎮 **Web App**       | http://localhost:3000          | Main application                                |
| 🔧 **API Server**    | http://localhost:4000/v1       | REST API endpoints                              |
| 📚 **API Docs**      | http://localhost:4000/api/docs | Swagger UI                                      |
| 🏥 **Health Check**  | http://localhost:4000/health   | API health status                               |
| 🗄️ **PostgreSQL**    | localhost:5432                 | Database (use Prisma Studio)                    |
| ⚡ **Redis**         | localhost:6379                 | Cache server                                    |
| 📦 **MinIO**         | http://localhost:9001          | S3-compatible storage (minioadmin / minioadmin) |
| 📧 **Mailhog**       | http://localhost:8025          | Email testing interface                         |
| 🎨 **Prisma Studio** | Run `pnpm db:studio`           | Database GUI                                    |

---

## Demo Login Credentials

After seeding the database, use these accounts to test different roles:

| Role            | Email                    | Password     | Access Level             |
| --------------- | ------------------------ | ------------ | ------------------------ |
| **Bank Admin**  | admin@nbc.com            | Password123! | Full system access       |
| **Organizer**   | organizer@nbc.com        | Password123! | Create/manage hackathons |
| **Mentor**      | mentor@vaultix.com       | Password123! | Mentor participants      |
| **Judge**       | judge@nbc.com            | Password123! | Score submissions        |
| **Participant** | participant1@example.com | Password123! | Join events              |

---

## Common Commands

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps for production
pnpm lint             # Lint all code
pnpm typecheck        # Type check all TypeScript
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run all unit tests
pnpm test:cov         # Run tests with coverage
pnpm test:e2e         # Run end-to-end tests
pnpm test:watch       # Run tests in watch mode

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes to database
pnpm db:migrate       # Create and run migrations
pnpm db:seed          # Seed database with demo data
pnpm db:studio        # Open Prisma Studio GUI

# Docker Services
pnpm docker:up        # Start Docker services only
pnpm docker:down      # Stop Docker services
pnpm docker:logs      # View Docker service logs

# Cleanup
pnpm clean            # Remove all build artifacts
./stop.sh             # Stop all services and clear ports
```

---

## Stopping the Application

### Option 1: Keep Docker Services Running

Press `Ctrl+C` in the terminal where `./start.sh` is running. This stops the web and API servers but keeps Docker containers running.

### Option 2: Stop Everything

```bash
./stop.sh
```

This will:

- Stop all Node.js processes (pnpm, next, nest)
- Kill processes on ports 3000 and 4000
- Stop all Docker containers
- Verify all ports are cleared

---

## Troubleshooting

### Docker Not Running

**Problem**: `Docker is not running` error

**Solution**:

1. Open Docker Desktop application
2. Wait for Docker to start completely
3. Run `./start.sh` again

### Port Already in Use

**Problem**: `Port 3000 is already in use` or `Port 4000 is already in use`

**Solution**:

```bash
./stop.sh    # This clears all ports automatically
./start.sh   # Restart fresh
```

### Database Connection Failed

**Problem**: Database migration or connection errors

**Solution**:

```bash
# Reset everything
./stop.sh
docker compose down -v  # Remove volumes
./start.sh              # Start fresh
```

### Prisma Client Not Generated

**Problem**: `Cannot find module '@innovation-lab/database'`

**Solution**:

```bash
pnpm db:generate
```

### Installation Failed

**Problem**: `pnpm install` errors

**Solution**:

```bash
pnpm clean              # Remove node_modules
rm -rf node_modules     # Full cleanup
pnpm install            # Reinstall
```

---

## Next Steps

Now that you're running, explore these resources:

1. **[Getting Started Guide](./docs/GETTING-STARTED.md)** - Detailed setup and configuration
2. **[Development Guide](./docs/DEVELOPMENT.md)** - Development workflow and best practices
3. **[API Documentation](http://localhost:4000/api/docs)** - Interactive API explorer
4. **[Testing Guide](./docs/TESTING.md)** - How to write and run tests
5. **[Architecture Guide](./ARCHITECTURE.md)** - System design and technical decisions

---

## Project Structure

```
Innovation-Lab/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # NestJS backend (port 4000)
├── packages/
│   └── database/     # Prisma schema & migrations
├── docs/             # All documentation
├── infra/            # Terraform infrastructure
├── start.sh          # 🚀 Start everything
└── stop.sh           # 🛑 Stop everything
```

---

## Development Workflow

1. **Make changes** to code in `apps/web` or `apps/api`
2. **Hot reload** happens automatically
3. **View changes** in browser (web) or test with Swagger (API)
4. **Run tests**: `pnpm test`
5. **Commit changes**: Follow [Contributing Guide](./CONTRIBUTING.md)

---

## Need Help?

- **Documentation**: Check the `docs/` folder
- **Troubleshooting**: See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- **Issues**: https://github.com/mickelsamuel/Innovation-Lab/issues
- **Discussions**: https://github.com/mickelsamuel/Innovation-Lab/discussions

---

**Happy coding! 🎉**

Last Updated: November 2025
