# Architecture Documentation

## System Overview

Innovation Lab is a full-stack web platform built as a **monorepo** using modern technologies and architectural patterns. This document describes the system architecture, design decisions, and technical implementation.

---

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Technology Stack](#technology-stack)
- [Monorepo Structure](#monorepo-structure)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [Authentication & Authorization](#authentication--authorization)
- [API Design](#api-design)
- [File Storage](#file-storage)
- [Caching Strategy](#caching-strategy)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Design Decisions](#design-decisions)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │  External    │      │
│  │  (Next.js)   │  │   (Future)   │  │  API Clients │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              NestJS API (Port 4000)                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│   │
│  │  │   Auth   │ │  Users   │ │  Hacks   │ │ Gamify ││   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │  S3/MinIO    │      │
│  │   (Primary)  │  │   (Cache)    │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 18.3)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + React Context
- **Forms**: React Hook Form + Zod
- **Authentication**: NextAuth v5
- **Animations**: Framer Motion

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript 5.3
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Authentication**: Passport + JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Containerization**: Docker + Docker Compose
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Cloud**: AWS (RDS, ElastiCache, S3, ECS)

---

## Monorepo Structure

```
Innovation-Lab/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # NestJS backend
├── packages/
│   └── database/               # Shared Prisma client
├── infra/                      # Terraform modules
└── docs/                       # Documentation
```

### Why Monorepo?

**Advantages:**
- **Code Sharing**: Shared types and database client
- **Atomic Changes**: Update frontend and backend together
- **Simplified Dependencies**: Single `pnpm install`
- **Coordinated Releases**: Deploy both apps together
- **Developer Experience**: Single repository to clone

**Tool Choice:**
- **Turborepo**: Fast, incremental builds with remote caching
- **pnpm**: Fast, efficient, workspace-native package manager

---

## Frontend Architecture

### Next.js App Router

```
apps/web/src/
├── app/
│   ├── (auth)/                # Route group for auth pages
│   ├── api/                   # API routes (NextAuth)
│   ├── hackathons/            # Hackathon pages
│   ├── challenges/            # Challenge pages
│   ├── dashboard/             # User dashboard
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # Layout components
│   └── features/              # Feature components
├── lib/
│   ├── api.ts                 # API client
│   ├── auth.ts                # NextAuth config
│   └── utils.ts               # Utilities
└── styles/
    └── globals.css            # Global styles
```

### Key Patterns

**1. Server vs Client Components**
- **Server Components** (default): SEO, performance, data fetching
- **Client Components** (`'use client'`): Interactivity, state, effects

**2. Data Fetching**
- **Server Components**: Direct API calls
- **Client Components**: TanStack Query for caching

**3. Route Organization**
- **Route Groups**: `(auth)` for shared layouts without URL segments
- **Dynamic Routes**: `[slug]` for dynamic parameters
- **Parallel Routes**: `@modal` for modals (future)

**4. State Management**
- **Server State**: TanStack Query
- **Client State**: React Context + hooks
- **Form State**: React Hook Form
- **URL State**: Next.js routing

---

## Backend Architecture

### NestJS Module System

```
apps/api/src/
├── auth/                      # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   ├── guards/
│   └── strategies/
├── users/                     # User management module
├── hackathons/                # Hackathon module
├── gamification/              # Gamification module
└── common/                    # Shared utilities
    ├── prisma/               # Prisma service
    ├── decorators/
    ├── filters/
    └── pipes/
```

### Layered Architecture

```
┌─────────────────────────────────────┐
│          Controllers                │  HTTP Layer
│  (Handle requests/responses)        │
├─────────────────────────────────────┤
│           Services                  │  Business Logic
│  (Business rules, orchestration)    │
├─────────────────────────────────────┤
│         Repositories                │  Data Access
│  (Prisma queries)                   │
├─────────────────────────────────────┤
│           Database                  │  Persistence
│  (PostgreSQL + Redis)               │
└─────────────────────────────────────┘
```

### Module Design Principles

1. **Single Responsibility**: Each module handles one domain
2. **Dependency Injection**: Use NestJS DI container
3. **Interface Segregation**: DTOs for request/response
4. **Separation of Concerns**: Controllers → Services → Repositories

---

## Database Design

### Entity Relationship Overview

```
User ──┬── GamificationProfile (1:1)
       ├── TeamMembership (1:N)
       ├── HackathonSubmission (1:N)
       ├── ChallengeSubmission (1:N)
       └── XpEvent (1:N)

Hackathon ──┬── Team (1:N)
            ├── Submission (1:N)
            ├── Track (1:N)
            └── Judge (1:N)

Team ──┬── TeamMembership (1:N)
       └── Submission (1:N)

Submission ──┬── Score (1:N)
             └── File (1:N)

Challenge ──┬── ChallengeSubmission (1:N)
            └── Category (N:M)
```

### Key Design Decisions

**1. Soft Deletes**
- Use `deletedAt` timestamp instead of hard deletes
- Preserves data integrity and audit trails

**2. Audit Fields**
- All entities have: `createdAt`, `updatedAt`
- Critical entities add: `createdById`, `updatedById`

**3. JSON Columns**
- Use `Json` type for flexible metadata
- Example: `hackathon.schedule`, `submission.metadata`

**4. Enums**
- Database-level enums for type safety
- Example: `Role`, `HackathonStatus`, `SubmissionStatus`

**5. Indexes**
- Foreign keys automatically indexed
- Additional indexes on frequently queried fields
- Composite indexes for common query patterns

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────┐     1. Login      ┌─────────┐
│ Client  │ ─────────────────>│   API   │
└─────────┘                   └─────────┘
     │                             │
     │                        2. Validate
     │                             │
     │         3. JWT Tokens       ▼
     │     <─────────────────  ┌─────────┐
     │                         │Database │
     │                         └─────────┘
     │
     ▼
Store tokens
(localStorage)
```

### Authorization Strategy

**Role-Based Access Control (RBAC)**

```typescript
enum Role {
  BANK_ADMIN       // Full system access
  ORGANIZER        // Create/manage hackathons
  MODERATOR        // Content moderation
  JUDGE            // Score submissions
  MENTOR           // Mentor participants
  SPONSOR          // View analytics
  PROJECT_OWNER    // Manage challenges
  PARTICIPANT      // Join events
  VIEWER           // Read-only access
}
```

**Guard Stack:**
1. **JWT Guard**: Verify token validity
2. **Roles Guard**: Check user has required role(s)
3. **Policy Guard**: Custom business logic (future)

**Implementation:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BANK_ADMIN, Role.ORGANIZER)
@Post('hackathons')
createHackathon() { }
```

---

## API Design

### RESTful Conventions

**URL Structure:**
```
/v1/{resource}/{id}/{sub-resource}
```

**Examples:**
```
GET    /v1/hackathons
GET    /v1/hackathons/:id
POST   /v1/hackathons
PUT    /v1/hackathons/:id
DELETE /v1/hackathons/:id
GET    /v1/hackathons/:id/teams
POST   /v1/hackathons/:id/teams
```

### Versioning

- **URI Versioning**: `/v1`, `/v2`, etc.
- **Global Prefix**: `/v1` applied to all routes
- **Exception**: Health checks at `/health` (no version)

### Response Format

**Success (200-299):**
```json
{
  "id": "clxxx...",
  "name": "Example",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

**Error (400-599):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "email": ["must be a valid email"]
  }
}
```

### Pagination

```
GET /v1/hackathons?page=1&limit=10

Response:
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## File Storage

### Storage Strategy

**Development:**
- **MinIO**: S3-compatible local storage
- **Location**: Docker container
- **URL**: http://localhost:9000

**Production:**
- **AWS S3**: Scalable object storage
- **CloudFront CDN**: Global content delivery
- **Signed URLs**: Secure file access

### File Upload Flow

```
Client ──> API ──> Validate ──> S3 ──> Database
           (1)      (2)         (3)     (4)

1. Multipart form data
2. MIME type, size, virus scan
3. Upload to S3 with unique key
4. Store metadata in PostgreSQL
```

### File Organization

```
bucket/
├── avatars/
│   └── {userId}/
│       └── {filename}
├── submissions/
│   └── {hackathonId}/
│       └── {submissionId}/
│           └── {filename}
└── challenges/
    └── {challengeId}/
        └── {filename}
```

---

## Caching Strategy

### Redis Usage

**1. Session Storage**
- User sessions
- JWT refresh tokens
- TTL: 7 days

**2. Rate Limiting**
- Request counters per IP/user
- TTL: 1 minute (configurable)

**3. Application Cache**
- Leaderboards (hot data)
- Badge definitions
- Configuration
- TTL: 5-60 minutes

**4. Future: Queue Management**
- BullMQ job queues
- Email notifications
- Async processing

### Cache Invalidation

**Strategies:**
- **TTL-based**: Expire after time period
- **Event-based**: Invalidate on updates
- **Cache-aside**: Load on miss, update on write

---

## Security Architecture

### Defense in Depth

**Layer 1: Network**
- HTTPS only in production
- CORS restrictions
- Rate limiting

**Layer 2: Application**
- Input validation (Zod + class-validator)
- Output encoding (XSS prevention)
- CSRF tokens
- SQL injection prevention (Prisma)

**Layer 3: Authentication**
- JWT with short expiry (15 min)
- Refresh token rotation
- 2FA support

**Layer 4: Authorization**
- Role-based access control
- Resource ownership checks
- Policy-based rules

**Layer 5: Data**
- Encryption at rest (database)
- Encryption in transit (TLS)
- PII minimization
- Audit logging

### Security Headers

```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
})
```

---

## Deployment Architecture

### Local Development

```
Docker Compose
├── PostgreSQL (5432)
├── Redis (6379)
├── MinIO (9000, 9001)
└── Mailhog (1025, 8025)

pnpm dev
├── Next.js (3000)
└── NestJS (4000)
```

### Production (AWS)

```
┌─────────────────────────────────────────┐
│            CloudFront CDN                │
│         (Static Assets + API)            │
└─────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│  S3 Bucket      │  │   ALB           │
│  (Next.js)      │  │   (API)         │
└─────────────────┘  └─────────────────┘
                              │
                     ┌────────┴────────┐
                     ▼                 ▼
              ┌────────────┐    ┌────────────┐
              │ ECS Task 1 │    │ ECS Task 2 │
              │  (NestJS)  │    │  (NestJS)  │
              └────────────┘    └────────────┘
                     │                 │
         ┌───────────┴─────────────────┴───────┐
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│   RDS           │                  │  ElastiCache    │
│  (PostgreSQL)   │                  │    (Redis)      │
└─────────────────┘                  └─────────────────┘
```

---

## Design Decisions

### Why Next.js 15?
- **App Router**: Better performance, streaming
- **Server Components**: Reduced client JS
- **Built-in optimizations**: Images, fonts, scripts
- **TypeScript-first**: Excellent DX

### Why NestJS?
- **Modular architecture**: Scales well
- **Dependency injection**: Testable code
- **TypeScript**: Type safety throughout
- **Batteries included**: Guards, pipes, interceptors
- **OpenAPI**: Auto-generated docs

### Why Prisma?
- **Type safety**: Generated types
- **Migration system**: Version-controlled schema
- **Developer experience**: Excellent tooling
- **Performance**: Efficient queries

### Why PostgreSQL?
- **ACID compliance**: Data integrity
- **JSON support**: Flexible metadata
- **Performance**: Excellent for relational data
- **Ecosystem**: Mature, well-supported

### Why Turborepo?
- **Fast builds**: Incremental compilation
- **Remote caching**: Share build artifacts
- **Simple config**: Works out of the box
- **Monorepo-native**: Built for this use case

### Why pnpm?
- **Disk efficiency**: Shared dependencies
- **Speed**: Faster than npm/yarn
- **Workspace support**: Native monorepo
- **Strict**: Better dependency resolution

---

## Performance Considerations

### Frontend
- **Code splitting**: Automatic with Next.js
- **Image optimization**: Next/Image component
- **Font optimization**: next/font
- **Lazy loading**: Dynamic imports
- **Caching**: TanStack Query

### Backend
- **Database indexes**: Optimize queries
- **Connection pooling**: Prisma built-in
- **Redis caching**: Hot data
- **Pagination**: Limit result sets
- **N+1 prevention**: Prisma includes

### Network
- **CDN**: CloudFront for static assets
- **Compression**: gzip/brotli
- **HTTP/2**: Multiplexing
- **Keep-alive**: Persistent connections

---

## Scalability Strategy

### Horizontal Scaling
- **Stateless API**: Scale ECS tasks
- **Load balancing**: ALB distributes traffic
- **Database**: RDS read replicas
- **Cache**: Redis cluster

### Vertical Scaling
- **Database**: Upgrade RDS instance
- **Cache**: Upgrade ElastiCache nodes
- **API**: Larger ECS tasks

---

## Monitoring & Observability

### Logging
- **Structured logs**: Pino JSON format
- **Correlation IDs**: Track requests
- **Log levels**: info, warn, error
- **Centralized**: CloudWatch (production)

### Metrics
- **Health checks**: `/health`, `/health/ready`
- **Custom metrics**: Prometheus format
- **Performance**: Response times, throughput

### Tracing (Future)
- **OpenTelemetry**: Distributed tracing
- **Spans**: Track request flow
- **Correlation**: Link logs and traces

---

## Future Considerations

### Planned Enhancements
- **GraphQL API**: Alongside REST
- **WebSockets**: Real-time features
- **Microservices**: Split large modules
- **Event Sourcing**: Audit trail
- **CQRS**: Read/write separation
- **Mobile App**: React Native
- **Internationalization**: Multi-language

---

Last Updated: November 2025
