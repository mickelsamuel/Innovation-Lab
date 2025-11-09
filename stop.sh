#!/bin/bash

# Innovation Lab Stop Script
# This script stops all services and clears ports

# Add Docker to PATH if it's not already there
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
export PATH="/usr/local/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}=====================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}=====================================${NC}"
}

kill_port() {
    local port=$1
    local name=$2

    print_status "Checking port ${port} (${name})..."

    # Find PIDs using the port
    local pids=$(lsof -ti :${port} 2>/dev/null)

    if [ -z "$pids" ]; then
        print_status "Port ${port} is already free"
    else
        print_status "Killing processes on port ${port}: ${pids}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1

        # Verify port is free
        if lsof -ti :${port} >/dev/null 2>&1; then
            print_warning "Some processes on port ${port} may still be running"
        else
            print_success "Port ${port} cleared"
        fi
    fi
}

kill_node_processes() {
    print_status "Stopping Node.js development servers..."

    # Kill pnpm dev processes
    if pgrep -f "pnpm dev" >/dev/null 2>&1; then
        print_status "Killing pnpm dev processes..."
        pkill -9 -f "pnpm dev" 2>/dev/null || true
    fi

    # Kill next dev processes
    if pgrep -f "next dev" >/dev/null 2>&1; then
        print_status "Killing Next.js dev server..."
        pkill -9 -f "next dev" 2>/dev/null || true
    fi

    # Kill nest start processes
    if pgrep -f "nest start" >/dev/null 2>&1; then
        print_status "Killing NestJS dev server..."
        pkill -9 -f "nest start" 2>/dev/null || true
    fi

    # Kill turbo processes
    if pgrep -f "turbo run dev" >/dev/null 2>&1; then
        print_status "Killing Turbo processes..."
        pkill -9 -f "turbo run dev" 2>/dev/null || true
    fi

    sleep 2
    print_success "Node.js processes stopped"
}

main() {
    clear
    print_header "🛑 Stopping Innovation Lab"
    echo ""

    print_header "Stopping Application Services"

    # Stop Node.js processes
    kill_node_processes
    echo ""

    # Clear application ports
    print_header "Clearing Application Ports"
    kill_port 3000 "Web Application"
    kill_port 4000 "API Server"
    echo ""

    # Stop Docker services
    print_header "Stopping Docker Services"
    print_status "Stopping PostgreSQL, Redis, MinIO, and Mailhog..."
    docker compose down 2>/dev/null || print_warning "Docker services may not be running"
    print_success "Docker services stopped"
    echo ""

    print_header "✅ Cleanup Complete"
    print_success "All services stopped and ports cleared!"
    echo ""
    print_status "Ports freed:"
    echo "  • 3000 (Web Application)"
    echo "  • 4000 (API Server)"
    echo "  • 5432 (PostgreSQL)"
    echo "  • 6379 (Redis)"
    echo "  • 9000/9001 (MinIO)"
    echo "  • 1025/8025 (Mailhog)"
    echo ""
    print_status "To start again, run: ${GREEN}./start.sh${NC}"
}

main
