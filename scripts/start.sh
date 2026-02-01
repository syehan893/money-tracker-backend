#!/bin/bash

# Finance OS Backend - Start Script
# Usage: ./scripts/start.sh [development|production|staging]

set -e

ENV=${1:-production}
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Starting Finance OS Backend in $ENV mode..."

cd "$APP_DIR"

# Check if already running
if pm2 describe finance-os-backend > /dev/null 2>&1; then
    echo "Application is already running. Use restart.sh to restart."
    pm2 status finance-os-backend
    exit 0
fi

# Ensure dist folder exists
if [ ! -d "dist" ]; then
    echo "Building application..."
    npm run build
fi

# Ensure logs directory exists
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env "$ENV"

echo ""
echo "Application started successfully!"
pm2 status finance-os-backend
