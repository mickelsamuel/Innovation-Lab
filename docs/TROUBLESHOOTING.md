# Troubleshooting Guide

Common issues, solutions, and debugging techniques for the Innovation Lab platform.

---

## Table of Contents

- [Quick Fixes](#quick-fixes)
- [Installation Issues](#installation-issues)
- [Docker Issues](#docker-issues)
- [Database Issues](#database-issues)
- [API Issues](#api-issues)
- [Frontend Issues](#frontend-issues)
- [Port Conflicts](#port-conflicts)
- [Authentication Issues](#authentication-issues)
- [Build & Compilation Issues](#build--compilation-issues)
- [Testing Issues](#testing-issues)
- [Performance Issues](#performance-issues)
- [Debugging Techniques](#debugging-techniques)

---

## Quick Fixes

### Nuclear Option (Reset Everything)

When all else fails:

```bash
./stop.sh
docker compose down -v
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
./start.sh
```

This will:
- Stop all services
- Remove Docker volumes (database data)
- Remove all node_modules
- Reinstall everything fresh
- Restart

---

## Installation Issues

### Error: `pnpm: command not found`

**Solution:**
```bash
npm install -g pnpm
```

Verify installation:
```bash
pnpm --version  # Should be ≥ 8.0.0
```

### Error: `Node version too old`

**Problem**: Node.js < 20.0.0

**Solution:**
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### Error: `pnpm install` fails with ENOENT

**Problem**: Corrupted lock file or cache

**Solution:**
```bash
rm pnpm-lock.yaml
rm -rf node_modules
pnpm install
```

### Error: `Cannot find module '@innovation-lab/database'`

**Problem**: Prisma client not generated

**Solution:**
```bash
pnpm db:generate
```

---

## Docker Issues

### Error: `Docker is not running`

**Solution:**
1. Open Docker Desktop application
2. Wait for Docker to fully start (whale icon should be steady)
3. Verify: `docker ps`
4. Retry: `./start.sh`

### Error: `Cannot connect to Docker daemon`

**macOS/Linux:**
```bash
sudo systemctl start docker
```

**Windows:**
- Start Docker Desktop from Start menu
- Ensure WSL 2 is enabled

### Error: `port is already allocated`

**Problem**: Port conflict in Docker

**Solution:**
```bash
docker compose down
lsof -ti:5432 | xargs kill  # Kill PostgreSQL
lsof -ti:6379 | xargs kill  # Kill Redis
docker compose up -d
```

### Docker containers keep restarting

**Check logs:**
```bash
docker compose logs -f postgres
docker compose logs -f redis
```

**Common causes:**
- Port conflicts
- Insufficient memory
- Corrupted volumes

**Solution:**
```bash
docker compose down -v  # Remove volumes
docker compose up -d
```

---

## Database Issues

### Error: `P1001: Can't reach database server`

**Problem**: PostgreSQL not running or wrong connection string

**Check:**
```bash
docker ps | grep postgres
```

**Solution:**
```bash
# Restart PostgreSQL
docker compose restart postgres

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
# Should be: postgresql://innovationlab:password@localhost:5432/innovationlab?schema=public
```

### Error: `Migration failed` or `Schema drift`

**Solution 1: Push schema (dev only)**
```bash
pnpm db:push
```

**Solution 2: Reset database**
```bash
docker compose down -v
docker compose up -d
sleep 10  # Wait for PostgreSQL
pnpm db:push
pnpm db:seed
```

### Error: `Prisma client out of sync`

**Solution:**
```bash
pnpm db:generate
```

### Cannot connect to Prisma Studio

**Problem**: Port 5555 in use

**Solution:**
```bash
lsof -ti:5555 | xargs kill
pnpm db:studio
```

### Database is slow

**Check connections:**
```sql
SELECT count(*) FROM pg_stat_activity;
```

**Solution:**
- Restart PostgreSQL: `docker compose restart postgres`
- Check indexes in Prisma schema
- Review slow queries in logs

---

## API Issues

### Error: `Cannot GET /v1/endpoint`

**Problem**: Wrong URL or API not running

**Check:**
```bash
curl http://localhost:4000/health
```

**Expected**: `{"status":"ok"}`

**If fails:**
```bash
cd apps/api
pnpm dev
```

### Error: `401 Unauthorized`

**Problem**: Missing or invalid JWT token

**Solution:**
1. Login to get fresh token
2. Include in header: `Authorization: Bearer <token>`
3. Check token expiry (15 minutes default)

### Error: `429 Too Many Requests`

**Problem**: Rate limiting triggered

**Solution:**
- Wait 1 minute
- Or temporarily disable in `apps/api/src/main.ts`

### API returns 500 errors

**Check logs:**
```bash
# In terminal running API
# Look for error stack traces
```

**Common causes:**
- Database connection lost
- Unhandled exception
- Missing environment variable

**Debug:**
```bash
cd apps/api
pnpm dev  # Run with debugging
```

### Swagger UI not loading

**Problem**: Not in development mode

**Solution:**
```bash
# Ensure NODE_ENV is not 'production'
echo $NODE_ENV

# Should be empty or 'development'
```

---

## Frontend Issues

### Error: `npm ERR! missing script: dev`

**Problem**: Running npm instead of pnpm

**Solution:**
```bash
pnpm dev  # Not npm dev
```

### Error: `Error: EADDRINUSE: address already in use :::3000`

**Problem**: Port 3000 is occupied

**Solution:**
```bash
lsof -ti:3000 | xargs kill
pnpm dev
```

### Page shows "404 | This page could not be found"

**Possible causes:**
1. Route doesn't exist - check `apps/web/src/app/`
2. Dynamic route missing - check `[slug]` or `[id]` params
3. Server not running - verify `http://localhost:3000`

### API calls fail with CORS errors

**Problem**: CORS not configured or wrong origin

**Solution in `apps/api/src/main.ts`:**
```typescript
app.enableCors({
  origin: ['http://localhost:3000'], // Add your origin
  credentials: true,
});
```

### Styles not loading

**Problem**: Tailwind not compiling

**Solution:**
```bash
cd apps/web
rm -rf .next
pnpm dev
```

### Images not loading

**Problem**: Next/Image configuration or paths

**Check:**
- Image path is correct
- Image exists in `public/` folder
- Domain is allowed in `next.config.js`

---

## Port Conflicts

### Ports Used by Innovation Lab

| Port | Service | Command to Free |
|------|---------|-----------------|
| 3000 | Next.js Web App | `lsof -ti:3000 \| xargs kill` |
| 4000 | NestJS API | `lsof -ti:4000 \| xargs kill` |
| 5432 | PostgreSQL | `docker compose stop postgres` |
| 6379 | Redis | `docker compose stop redis` |
| 9000 | MinIO API | `docker compose stop minio` |
| 9001 | MinIO Console | `docker compose stop minio` |
| 8025 | Mailhog UI | `docker compose stop mailhog` |
| 5555 | Prisma Studio | `lsof -ti:5555 \| xargs kill` |

### Find what's using a port

```bash
lsof -i :3000  # Shows process using port 3000
```

### Kill all project processes

```bash
./stop.sh  # Automated cleanup
```

---

## Authentication Issues

### Cannot login with demo accounts

**Problem**: Database not seeded

**Solution:**
```bash
pnpm db:seed
```

### "Invalid credentials" error

**Check:**
1. Email is correct
2. Password is correct (case-sensitive)
3. Account exists in database
4. Account is not banned

**Verify in database:**
```bash
pnpm db:studio
# Check Users table
```

### JWT token expired

**Problem**: Token expires after 15 minutes

**Solution:**
- Login again to get fresh token
- Implement refresh token flow (see API docs)

### 2FA setup fails

**Problem**: Time sync issue

**Solution:**
- Ensure device clock is accurate
- Use authenticator app (Google Authenticator, Authy)
- Regenerate secret if needed

---

## Build & Compilation Issues

### TypeScript errors

**Solution:**
```bash
# Check errors
pnpm typecheck

# Common fixes
pnpm db:generate  # Regenerate Prisma types
rm -rf .next      # Clear Next.js cache
rm -rf dist       # Clear NestJS build
```

### ESLint errors

**Solution:**
```bash
pnpm lint
pnpm lint --fix  # Auto-fix
```

### Build fails with memory error

**Problem**: Not enough memory

**Solution:**
```bash
# Increase Node memory
export NODE_OPTIONS="--max_old_space_size=4096"
pnpm build
```

---

## Testing Issues

### Tests fail with database errors

**Problem**: Test database not configured

**Solution:**
```bash
# Ensure .env.test exists in apps/api/
cat apps/api/.env.test

# Should have test database URL
```

### E2E tests timeout

**Solution:**
```bash
# Ensure app is running
./start.sh

# Run tests with increased timeout
pnpm test:e2e --timeout=60000
```

### Coverage below threshold

**Problem**: Not enough tests

**Solution:**
- Write more tests
- Or temporarily lower threshold in config

---

## Performance Issues

### App is slow

**Check:**
1. Docker resources (CPU/Memory)
2. Database query performance
3. Network latency
4. Build mode (dev vs prod)

**Solutions:**
```bash
# Use production build
pnpm build
pnpm start

# Check Docker resources
docker stats

# Optimize database
pnpm db:studio  # Check indexes
```

### Hot reload is slow

**Solution:**
```bash
# Clear caches
rm -rf .next
rm -rf .turbo
rm -rf dist
pnpm dev
```

---

## Debugging Techniques

### Backend Debugging

**Console logging:**
```typescript
console.log('Debug:', value);
```

**Structured logging (Pino):**
```typescript
this.logger.debug({ data }, 'Debug message');
```

**VS Code Debugger:**
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "attach",
  "name": "Attach NestJS",
  "port": 9229
}
```

Run with debug:
```bash
node --inspect apps/api/dist/main.js
```

### Frontend Debugging

**React DevTools:**
- Install browser extension
- Inspect component tree and props

**Console logging:**
```typescript
console.log('State:', state);
console.table(data);  # Pretty print arrays
```

**Network tab:**
- Check API requests/responses
- Verify headers and payload

### Database Debugging

**View queries:**
```typescript
// In Prisma query
const result = await prisma.user.findMany({
  where: { ... }
});
console.log(result);  // Log prisma query results
```

**Enable query logging:**
```typescript
// packages/database/src/index.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## Getting More Help

If your issue isn't listed here:

1. **Search GitHub Issues**: https://github.com/mickelsamuel/Innovation-Lab/issues
2. **Check Discussions**: https://github.com/mickelsamuel/Innovation-Lab/discussions
3. **Review Logs**: Check terminal output for error messages
4. **Enable Debug Mode**: Set `DEBUG=*` environment variable
5. **Ask for Help**: Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Error messages
   - Environment info (OS, Node version, etc.)

---

## Useful Commands Summary

```bash
# Complete reset
./stop.sh && docker compose down -v && rm -rf node_modules && pnpm install && ./start.sh

# Restart just Docker
docker compose down && docker compose up -d

# Restart just apps
# Ctrl+C then ./start.sh

# Check service health
curl http://localhost:4000/health

# View logs
docker compose logs -f
pnpm docker:logs

# Database reset
docker compose down -v && docker compose up -d && sleep 10 && pnpm db:push && pnpm db:seed

# Clear caches
rm -rf .next .turbo dist node_modules/.cache
```

---

Last Updated: November 2025

**Still stuck? Open an issue!**
https://github.com/mickelsamuel/Innovation-Lab/issues
