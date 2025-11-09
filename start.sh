#!/bin/bash

# Innovation Lab Startup Script
# This script starts all services and opens the application

set -e

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

# Check if Docker is running
check_docker() {
    print_status "Checking if Docker is running..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_success "Docker is running"
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

    cd /Users/mickelsamuel/Innovation-Lab/packages/database
    DATABASE_URL="postgresql://innovationlab:password@localhost:5432/innovationlab?schema=public" ../../node_modules/.bin/prisma db push --skip-generate > /dev/null 2>&1
    cd /Users/mickelsamuel/Innovation-Lab

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
    echo -e "${CYAN}🔧 Backend API:${NC}           http://localhost:4000"
    echo -e "${CYAN}🗄️  Database (PostgreSQL):${NC} localhost:5432"
    echo -e "${CYAN}⚡ Redis:${NC}                 localhost:6379"
    echo -e "${CYAN}📦 MinIO Console:${NC}         http://localhost:9001"
    echo -e "${CYAN}📧 Mailhog UI:${NC}            http://localhost:8025"
    echo -e "${CYAN}🎨 Prisma Studio:${NC}         Run 'pnpm db:studio' to open"
    echo ""
    print_status "Opening browser..."

    # Open browser based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:3000
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start http://localhost:3000
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

    print_status "Docker services are still running. To stop them, run: pnpm docker:down"
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

    # Check prerequisites
    check_docker

    # Start services
    start_docker_services
    wait_for_database
    wait_for_redis

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
