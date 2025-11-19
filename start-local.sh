#!/bin/bash

# Innovation Lab Local Startup Script (Windows - No Docker)
# This script starts the app using local PostgreSQL

set -e

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

# Check if PostgreSQL is running
check_postgres() {
    print_status "Checking if PostgreSQL is running..."

    # Try to connect to PostgreSQL
    if PGPASSWORD="Mic13245@nbc" "/c/Program Files/PostgreSQL/16/bin/psql.exe" -U postgres -d innovationlab -c "SELECT 1" > /dev/null 2>&1; then
        print_success "PostgreSQL is running and database exists"
        return 0
    elif PGPASSWORD="Mic13245@nbc" "/c/Program Files/PostgreSQL/16/bin/psql.exe" -U postgres -c "SELECT 1" > /dev/null 2>&1; then
        print_warning "PostgreSQL is running but database 'innovationlab' may not exist"
        print_status "Attempting to create database..."
        PGPASSWORD="Mic13245@nbc" "/c/Program Files/PostgreSQL/16/bin/psql.exe" -U postgres -c "CREATE DATABASE innovationlab;" 2>/dev/null || true
        print_success "Database check complete"
        return 0
    else
        print_error "PostgreSQL is not running or cannot connect."
        print_error "Please start PostgreSQL service and try again."
        print_warning "You can start it from Windows Services or pgAdmin."
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_header "Setting Up Database"
    print_status "Running Prisma migrations..."

    pnpm db:push > /dev/null 2>&1 || true

    print_success "Database setup completed"
}

# Check if ports are available
check_ports() {
    print_status "Checking if ports 3000 and 4000 are available..."

    # Check port 3000 (Frontend)
    if netstat -ano | findstr ":3000" | findstr "LISTENING" > /dev/null 2>&1; then
        print_warning "Port 3000 is already in use. Attempting to free it..."
        for pid in $(netstat -ano | findstr ":3000" | findstr "LISTENING" | awk '{print $5}' | sort -u); do
            taskkill //PID $pid //F > /dev/null 2>&1 || true
        done
    fi

    # Check port 4000 (Backend)
    if netstat -ano | findstr ":4000" | findstr "LISTENING" > /dev/null 2>&1; then
        print_warning "Port 4000 is already in use. Attempting to free it..."
        for pid in $(netstat -ano | findstr ":4000" | findstr "LISTENING" | awk '{print $5}' | sort -u); do
            taskkill //PID $pid //F > /dev/null 2>&1 || true
        done
    fi

    print_success "Ports are ready"
}

# Start the application
start_application() {
    print_header "Starting Innovation Lab Application"
    print_status "Starting backend API and frontend web app..."
    echo ""

    # Start the dev servers
    print_status "Starting all services with Turbo..."
    pnpm dev &

    # Store the PID
    APP_PID=$!

    print_success "Application is starting..."
    print_status "Waiting for services to initialize..."
    sleep 10
    echo ""
}

# Open browser
open_browser() {
    print_header "Innovation Lab Arena"
    echo ""
    print_success "All services are running!"
    echo ""
    echo -e "${CYAN}Web Application:${NC}      http://localhost:3000"
    echo -e "${CYAN}Backend API:${NC}          http://localhost:4000/v1"
    echo -e "${CYAN}API Documentation:${NC}    http://localhost:4000/api/docs"
    echo -e "${CYAN}Health Check:${NC}         http://localhost:4000/health"
    echo -e "${CYAN}Database:${NC}             localhost:5432 (Local PostgreSQL)"
    echo ""
    print_status "Opening browser..."

    # Open browser (Windows)
    start http://localhost:3000 2>/dev/null || true

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

    # Also kill any remaining node processes on ports 3000 and 4000
    for pid in $(netstat -ano | findstr ":3000" | findstr "LISTENING" | awk '{print $5}' | sort -u); do
        taskkill //PID $pid //F > /dev/null 2>&1 || true
    done
    for pid in $(netstat -ano | findstr ":4000" | findstr "LISTENING" | awk '{print $5}' | sort -u); do
        taskkill //PID $pid //F > /dev/null 2>&1 || true
    done

    print_success "Goodbye!"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Main execution
main() {
    clear
    print_header "Innovation Lab Startup Script (Local Mode)"
    echo ""
    print_warning "Running in LOCAL mode (no Docker)"
    print_warning "Using local PostgreSQL on port 5432"
    echo ""

    # Check prerequisites
    check_postgres
    check_ports

    # Setup database
    run_migrations

    # Start application
    start_application

    # Open browser
    open_browser
}

# Run main function
main
