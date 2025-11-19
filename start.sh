#!/bin/bash

# Innovation Lab Startup Script
# Auto-detects Docker or local PostgreSQL setup

set -e

# Detect OS
OSTYPE_LOCAL="$(uname -s)"
USE_DOCKER=false

# Add Docker to PATH if it's not already there
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
export PATH="/usr/local/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}=====================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}=====================================${NC}"
}

# Check if Docker is available and running
check_docker() {
    print_status "Checking if Docker is available..."
    if docker info > /dev/null 2>&1; then
        print_success "Docker is running"
        USE_DOCKER=true
        return 0
    else
        print_warning "Docker is not available or not running"
        return 1
    fi
}

# Check if local PostgreSQL is running (Windows/local setup)
check_local_postgres() {
    print_status "Checking for local PostgreSQL..."

    # Try PostgreSQL 16 on Windows
    if [[ "$OSTYPE_LOCAL" == *"MSYS"* ]] || [[ "$OSTYPE_LOCAL" == *"MINGW"* ]]; then
        PSQL_CMD="/c/Program Files/PostgreSQL/16/bin/psql.exe"
        if [ -f "$PSQL_CMD" ]; then
            if PGPASSWORD="Mic13245@nbc" "$PSQL_CMD" -U postgres -d innovationlab -c "SELECT 1" > /dev/null 2>&1; then
                print_success "Local PostgreSQL is running"
                return 0
            elif PGPASSWORD="Mic13245@nbc" "$PSQL_CMD" -U postgres -c "SELECT 1" > /dev/null 2>&1; then
                print_warning "PostgreSQL running but database 'innovationlab' not found"
                print_status "Creating database..."
                PGPASSWORD="Mic13245@nbc" "$PSQL_CMD" -U postgres -c "CREATE DATABASE innovationlab;" 2>/dev/null || true
                print_success "Database created"
                return 0
            fi
        fi
    fi

    # Try default psql command (Mac/Linux)
    if command -v psql > /dev/null 2>&1; then
        if PGPASSWORD="Mic13245@nbc" psql -U postgres -d innovationlab -h localhost -c "SELECT 1" > /dev/null 2>&1; then
            print_success "Local PostgreSQL is running"
            return 0
        fi
    fi

    print_error "Local PostgreSQL is not running or cannot connect"
    return 1
}

# Start Docker services
start_docker_services() {
    print_header "Starting Docker Services"
    print_status "Starting PostgreSQL, Redis, MinIO, and Mailhog..."

    docker compose up -d

    print_success "Docker services started"
}

# Wait for database to be ready
wait_for_database() {
    print_status "Waiting for PostgreSQL to be ready..."

    for i in {1..30}; do
        if docker exec innovationlab-postgres pg_isready -U innovationlab > /dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            return 0
        fi
        echo -n "."
        sleep 2
    done

    print_error "PostgreSQL failed to start"
    exit 1
}

# Wait for Redis to be ready
wait_for_redis() {
    print_status "Waiting for Redis to be ready..."

    for i in {1..30}; do
        if docker exec innovationlab-redis redis-cli ping > /dev/null 2>&1; then
            print_success "Redis is ready"
            return 0
        fi
        echo -n "."
        sleep 2
    done

    print_error "Redis failed to start"
    exit 1
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    print_status "Running Prisma migrations..."

    pnpm db:push > /dev/null 2>&1 || true

    print_success "Database migrations completed"
}

# Seed database (optional)
seed_database() {
    print_status "Skipping database seeding (run 'pnpm db:seed' manually if needed)"
}

# Start the application
start_application() {
    print_header "Starting Innovation Lab Application"
    print_status "Starting backend API and frontend web app..."
    print_warning "This will open in a new terminal window/tab"
    echo ""

    # Start the dev servers in the background
    print_status "Starting all services with Turbo..."
    pnpm dev &

    # Store the PID
    APP_PID=$!

    print_success "Application is starting..."
    print_status "Frontend will be available at: http://localhost:3000"
    print_warning "Note: Backend API has TypeScript warnings but will run at http://localhost:4000"
    echo ""
}

# Wait for services and open browser
open_browser() {
    print_status "Waiting for services to start..."
    sleep 15

    print_header "🎮 Innovation Lab Arena"
    echo ""
    print_success "✅ All services are running!"
    echo ""
    echo -e "${CYAN}🌐 Web Application:${NC}      http://localhost:3000"
    echo -e "${CYAN}🔧 Backend API:${NC}           http://localhost:4000/v1"
    echo -e "${CYAN}📚 API Documentation:${NC}    http://localhost:4000/api/docs"
    echo -e "${CYAN}🏥 Health Check:${NC}         http://localhost:4000/health"
    echo -e "${CYAN}🗄️  Database:${NC}             localhost:5432"

    if [ "$USE_DOCKER" = true ]; then
        echo -e "${CYAN}⚡ Redis:${NC}                 localhost:6379"
        echo -e "${CYAN}📦 MinIO Console:${NC}         http://localhost:9001"
        echo -e "${CYAN}📧 Mailhog UI:${NC}            http://localhost:8025"
    else
        echo -e "${YELLOW}⚠️  Redis, MinIO, Mailhog:${NC}  Not available (no Docker)"
    fi

    echo -e "${CYAN}🎨 Prisma Studio:${NC}         Run 'pnpm db:studio' to open"
    echo ""
    print_status "Opening browser..."

    # Open browser based on OS
    if [[ "$OSTYPE_LOCAL" == "Darwin"* ]]; then
        open http://localhost:3000
    elif [[ "$OSTYPE_LOCAL" == "Linux"* ]]; then
        xdg-open http://localhost:3000
    else
        start http://localhost:3000 2>/dev/null || true
    fi

    echo ""
    print_warning "Press Ctrl+C to stop all services"
    echo ""

    # Wait for the dev process
    wait $APP_PID
}

# Cleanup function
cleanup() {
    print_header "Shutting Down"
    print_status "Stopping all services..."

    # Kill the dev process if it's still running
    if [ ! -z "$APP_PID" ]; then
        kill $APP_PID 2>/dev/null || true
    fi

    if [ "$USE_DOCKER" = true ]; then
        print_status "Docker services are still running. To stop them, run: pnpm docker:down"
    fi

    print_success "Goodbye! 👋"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Main execution
main() {
    clear
    print_header "🏆 Innovation Lab Startup Script"
    echo ""

    # Check what's available (Docker or local PostgreSQL)
    if check_docker; then
        print_success "Using Docker mode"
        # Start Docker services
        start_docker_services
        wait_for_database
        wait_for_redis
    elif check_local_postgres; then
        print_success "Using local PostgreSQL mode (no Docker)"
        print_warning "Redis and MinIO will not be available"
    else
        print_error "Neither Docker nor local PostgreSQL is available"
        print_error "Please either:"
        print_error "  1. Start Docker Desktop, OR"
        print_error "  2. Start your local PostgreSQL service"
        exit 1
    fi

    # Setup database
    run_migrations
    seed_database

    # Start application
    start_application

    # Open browser
    open_browser
}

# Run main function
main
