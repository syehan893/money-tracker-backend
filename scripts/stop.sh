#!/bin/bash

# Finance OS Backend - Stop Script
# Usage: ./scripts/stop.sh

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Stopping Finance OS Backend..."

cd "$APP_DIR"

# Check if running
if ! pm2 describe finance-os-backend > /dev/null 2>&1; then
    echo "Application is not running."
    exit 0
fi

# Stop application
pm2 stop finance-os-backend

echo ""
echo "Application stopped successfully!"
pm2 status
