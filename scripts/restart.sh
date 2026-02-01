#!/bin/bash

# Finance OS Backend - Restart Script
# Usage: ./scripts/restart.sh [development|production|staging]
# Use --reload for zero-downtime restart

set -e

ENV=${1:-production}
RELOAD=false

# Check for --reload flag
for arg in "$@"; do
    if [ "$arg" == "--reload" ]; then
        RELOAD=true
    fi
done

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Restarting Finance OS Backend..."

cd "$APP_DIR"

# Check if running
if ! pm2 describe finance-os-backend > /dev/null 2>&1; then
    echo "Application is not running. Starting it..."
    ./scripts/start.sh "$ENV"
    exit 0
fi

if [ "$RELOAD" = true ]; then
    echo "Performing zero-downtime reload..."
    pm2 reload ecosystem.config.js --env "$ENV"
else
    echo "Performing restart..."
    pm2 restart ecosystem.config.js --env "$ENV"
fi

echo ""
echo "Application restarted successfully!"
pm2 status finance-os-backend
