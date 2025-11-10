# Innovation Lab 🚀

> **Enterprise Innovation Platform for National Bank of Canada**
> Built in Partnership with Vaultix

A complete, secure, and scalable web platform for running cross-departmental hackathons, innovation challenges, and gamified competitions across the entire organization. From Finance to HR, Security to Marketing, Operations to IT - any department can host challenges and drive innovation. Built with enterprise-grade security, modern tech stack, and exceptional user experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red?logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [📚 Documentation](#-documentation)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 **Virtual Hackathons**

- **Complete Event Lifecycle**: Registration → Team Formation → Mentoring → Submissions → Judging → Awards
- **Role-Based Access Control**: Bank Admin, Organizers, Mentors, Judges, Participants (9 roles)
- **Multi-Track Support**: Multiple competition tracks with dedicated prizes
- **Team Collaboration**: Team finder, invitations, real-time collaboration
- **Mentor System**: Office hours booking, Q&A forums, 1-on-1 sessions
- **Advanced Judging**: Weighted criteria, scoring rubrics, conflict-of-interest handling
- **Live Leaderboards**: Real-time rankings per event, track, and team

### 💡 **Cross-Departmental Challenges**

- **Any Department, Any Problem**:
  - 💰 **Finance**: Fraud detection models, risk assessment tools, financial forecasting
  - 👥 **HR**: Employee engagement platforms, recruitment automation, training programs
  - 🔒 **Security**: Threat detection systems, compliance automation, access control solutions
  - 📱 **Marketing**: Customer analytics, campaign optimization, social media tools
  - ⚙️ **Operations**: Process automation, efficiency improvements, workflow optimization
  - 💻 **IT**: Infrastructure improvements, app development, system integrations
  - ⚖️ **Legal**: Contract analysis, regulatory compliance tools, policy management
- **Flexible Submissions**: Individual or team submissions with version control
- **Problem Statements**: Rich text challenges with attachments and bounties
- **Review Workflows**: Multi-stage review process with department expert feedback
- **Winner Showcase**: Public portfolio pages for top solutions
- **Analytics Dashboard**: Views, submissions, conversion metrics, engagement tracking

### 🎮 **Gamification System (Vaultix Theme)**

- **XP & Leveling**: Earn points for participation, submissions, wins, mentoring
- **Progressive Levels**: 50 levels with milestone rewards
- **Badge Collection**: 40+ achievements across categories (common → legendary rarity)
- **Vault Keys**: Redeemable tokens for rewards marketplace
- **Leaderboards**: Global, seasonal, event-scoped, and category rankings
- **Daily Streaks**: Activity tracking with bonus multipliers

### 🔐 **Enterprise Security**

- **Multi-Factor Authentication**: Email/Password + Microsoft Entra ID SSO + TOTP 2FA
- **Fine-Grained Authorization**: Policy-based access control with role hierarchies
- **Input Validation**: Zod schemas (frontend) + class-validator (backend)
- **Content Security**: CSP with nonces, XSS protection, CSRF tokens
- **Rate Limiting**: IP-based + user-based + route-specific throttling
- **Comprehensive Audit Logging**: All critical actions logged for compliance
- **Data Privacy**: GDPR/PIPEDA compliance with export/delete endpoints
- **File Security**: MIME validation, size limits, malware scanning hooks

---

## 🛠 Tech Stack

### **Monorepo Architecture**

- **Turborepo** - High-performance build system with remote caching

### **Frontend** (`apps/web`)

- **Next.js 15** - React framework with App Router
- **TypeScript 5.3** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling framework
- **shadcn/ui + Radix UI** - Accessible component primitives
- **Framer Motion** - Fluid animations and transitions
- **React Hook Form + Zod** - Form management and validation
- **TanStack Query** - Server state management and caching
- **NextAuth v5** - Authentication (Credentials + OAuth)

### **Backend** (`apps/api`)

- **NestJS 10** - Progressive Node.js framework
- **TypeScript 5.3** - Type-safe JavaScript
- **Prisma ORM** - Type-safe database access layer
- **PostgreSQL 16** - Primary relational database
- **Redis 7** - Caching and session storage
- **BullMQ** - Background job processing (disabled temporarily)
- **Passport + JWT** - Authentication strategies
- **Swagger/OpenAPI** - Interactive API documentation

### **Database & Storage**

- **PostgreSQL 16** - Relational data with JSONB support
- **Prisma** - Database migrations and schema management
- **Redis** - Session storage and caching
- **AWS S3** - File storage (with local fallback for dev)
- **MinIO** - S3-compatible local development storage

### **Infrastructure & DevOps**

- **Docker & Docker Compose** - Containerized local development
- **Terraform** - Infrastructure as Code for AWS
- **GitHub Actions** - CI/CD pipelines
- **AWS Services**:
  - RDS (PostgreSQL production database)
  - ElastiCache (Redis)
  - S3 + CloudFront (CDN)
  - ECS Fargate / App Runner (Compute)
  - Route53 (DNS)
  - ACM (TLS Certificates)
  - WAF (Web Application Firewall)

### **Observability**

- **Pino** - Structured JSON logging
- **OpenTelemetry** - Distributed tracing (infrastructure ready)
- **Prometheus** - Metrics collection (infrastructure ready)
- **Health Checks** - Kubernetes-compatible probes

### **Testing**

- **Jest** - Backend unit and integration testing
- **Vitest** - Frontend unit testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end browser testing
- **Supertest** - HTTP assertion library

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 8.0.0
- **Docker Desktop** (running)
- **Git**

### Installation (5 Minutes)

1. **Clone the repository**

   ```bash
   git clone https://github.com/mickelsamuel/Innovation-Lab.git
   cd Innovation-Lab
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # The defaults work for local development - no changes needed!
   ```

4. **Start everything with one command**

   ```bash
   ./start.sh
   ```

   This script will:
   - ✅ Check Docker is running
   - ✅ Start PostgreSQL, Redis, MinIO, Mailhog
   - ✅ Wait for services to be healthy
   - ✅ Run database migrations
   - ✅ Seed demo data (optional)
   - ✅ Start API server (port 4000)
   - ✅ Start web app (port 3000)
   - ✅ Open browser automatically

5. **You're done! 🎉**

### Access Points

Once running:

| Service                  | URL                            | Notes                   |
| ------------------------ | ------------------------------ | ----------------------- |
| 🎮 **Web Application**   | http://localhost:3000          | Next.js frontend        |
| 🔧 **Backend API**       | http://localhost:4000/v1       | NestJS REST API         |
| 📚 **API Documentation** | http://localhost:4000/api/docs | Swagger UI              |
| 🏥 **Health Check**      | http://localhost:4000/health   | Service health          |
| 🗄️ **Database**          | localhost:5432                 | PostgreSQL              |
| ⚡ **Redis**             | localhost:6379                 | Cache                   |
| 📦 **MinIO Console**     | http://localhost:9001          | minioadmin / minioadmin |
| 📧 **Email Testing**     | http://localhost:8025          | Mailhog UI              |
| 🎨 **Prisma Studio**     | Run `pnpm db:studio`           | Database GUI            |

### Demo Accounts

After seeding, use these credentials:

| Role        | Email                    | Password     |
| ----------- | ------------------------ | ------------ |
| Bank Admin  | admin@nbc.com            | Password123! |
| Organizer   | organizer@nbc.com        | Password123! |
| Mentor      | mentor@vaultix.com       | Password123! |
| Judge       | judge@nbc.com            | Password123! |
| Participant | participant1@example.com | Password123! |

---

## 📁 Project Structure

```
Innovation-Lab/
├── apps/
│   ├── web/                      # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/             # App Router pages
│   │   │   ├── components/      # React components
│   │   │   ├── lib/             # Utilities and API clients
│   │   │   └── styles/          # Global styles
│   │   ├── public/              # Static assets
│   │   ├── e2e/                 # Playwright E2E tests
│   │   └── test/                # Test utilities
│   │
│   └── api/                     # NestJS backend API
│       ├── src/
│       │   ├── auth/            # Authentication & authorization
│       │   ├── users/           # User management
│       │   ├── hackathons/      # Hackathon features
│       │   ├── teams/           # Team management
│       │   ├── submissions/     # Submission handling
│       │   ├── challenges/      # Standalone challenges
│       │   ├── judging/         # Judging & scoring system
│       │   ├── gamification/    # XP, badges, leaderboards
│       │   ├── files/           # File upload/storage
│       │   ├── email/           # Email service
│       │   └── common/          # Shared utilities
│       └── test/                # Test utilities and E2E tests
│
├── packages/
│   └── database/                # Prisma schema and migrations
│       ├── prisma/
│       │   ├── schema.prisma    # Database models
│       │   ├── migrations/      # Migration history
│       │   └── seed.ts          # Seed data
│       └── src/
│
├── infra/                       # Terraform infrastructure
│   ├── modules/                 # Reusable Terraform modules
│   └── environments/            # Environment configs (dev/staging/prod)
│
├── docs/                        # Comprehensive documentation
│   ├── GETTING-STARTED.md       # Detailed setup guide
│   ├── DEVELOPMENT.md           # Development workflow
│   ├── TESTING.md               # Testing guide
│   ├── DEPLOYMENT.md            # Production deployment
│   ├── API.md                   # API quick reference
│   ├── BACKEND.md               # Backend architecture
│   ├── FRONTEND.md              # Frontend architecture
│   ├── SCRIPTS.md               # Automation scripts
│   └── TROUBLESHOOTING.md       # Common issues
│
├── .github/workflows/           # CI/CD pipelines
├── docker-compose.yml           # Local development services
├── start.sh                     # Start all services
├── stop.sh                      # Stop all services
└── README.md                    # This file
```

---

## 📚 Documentation

Comprehensive guides for all aspects of the platform:

### Getting Started

- **[Quick Start](./QUICK_START.md)** - Get running in 5 minutes
- **[Architecture](./ARCHITECTURE.md)** - System design and technical decisions

### Development Guides

- **[Backend Guide](./docs/BACKEND.md)** - Complete backend documentation (83+ endpoints, 17+ models)
- **[Frontend Guide](./docs/FRONTEND.md)** - Complete frontend documentation (35+ pages)
- **[WebSocket Guide](./docs/WEBSOCKET.md)** - Real-time features implementation
- **[Notifications Guide](./docs/NOTIFICATIONS.md)** - Email and in-app notifications

### Operations & Testing

- **[Testing Guide](./docs/TESTING.md)** - Unit, integration, and E2E tests (500+ tests)
- **[Scripts Reference](./docs/SCRIPTS.md)** - Automation scripts documentation
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Analytics & Monitoring

- **[Analytics Guide](./docs/ANALYTICS.md)** - Analytics dashboard and metrics
- **[Infrastructure](./infra/README.md)** - Terraform and AWS setup

### Contributing

- **[Contributing](./CONTRIBUTING.md)** - How to contribute to the project
- **[Security](./SECURITY.md)** - Security policy and vulnerability reporting
- **[Changelog](./CHANGELOG.md)** - Version history and release notes

---

## 🧪 Testing

Comprehensive test coverage across all layers:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

### Test Coverage

- **Backend**: ≥80% coverage requirement (137+ test cases)
- **Frontend**: ≥70% coverage requirement (23+ test cases)
- **E2E**: Critical user journeys covered

See [TESTING.md](./docs/TESTING.md) for comprehensive testing documentation.

---

## 🚢 Deployment

### Local Development (Default)

```bash
./start.sh  # Uses Docker Compose
```

### Staging/Production (AWS)

```bash
cd infra/environments/prod
terraform init
terraform plan
terraform apply
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

---

## 🔒 Security

### Security Features

- OWASP ASVS Level 2 compliance
- Multi-factor authentication (TOTP)
- Input validation at all boundaries
- Output encoding (XSS prevention)
- CSRF protection on mutations
- Rate limiting (IP + user + route)
- Content Security Policy with nonces
- Helmet security headers
- Session management with rotation
- Comprehensive audit logging
- PII minimization

### Reporting Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

See [SECURITY.md](./SECURITY.md) for our responsible disclosure policy.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development workflow
- Code style guidelines
- Pull request process
- Testing requirements
- Documentation standards

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **National Bank of Canada** - Project sponsor and partner
- **Vaultix** - Branding, design, and gamification partnership
- **Open Source Community** - For the amazing tools and ecosystem

---

## 📞 Support

- **Documentation**: https://github.com/mickelsamuel/Innovation-Lab/tree/main/docs
- **Issues**: https://github.com/mickelsamuel/Innovation-Lab/issues
- **Discussions**: https://github.com/mickelsamuel/Innovation-Lab/discussions

---

## 🎯 Project Status

- ✅ Authentication & Authorization - **Complete**
- ✅ User Management - **Complete**
- ✅ Gamification System - **Complete**
- ✅ Testing Infrastructure - **Complete** (187+ tests)
- 🚧 Hackathon Management - **In Progress**
- 🚧 Team Management - **In Progress**
- 🚧 Challenge System - **In Progress**
- 🚧 Judging System - **In Progress**
- 📋 Email Notifications - **Planned**
- 📋 Real-time Features - **Planned**
- 📋 Mobile App - **Planned**

---

**Built with ❤️ for innovation and collaboration**

Last Updated: November 2025
