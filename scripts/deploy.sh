#!/bin/bash

# Finance OS Backend - Deployment Script
# Usage: ./scripts/deploy.sh [branch]
# Example: ./scripts/deploy.sh main

set -e

BRANCH=${1:-main}
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "====================================="
echo "Finance OS Backend Deployment"
echo "====================================="
echo "Branch: $BRANCH"
echo "Directory: $APP_DIR"
echo ""

cd "$APP_DIR"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "WARNING: There are uncommitted changes in the working directory."
    echo "Please commit or stash changes before deploying."
    exit 1
fi

echo "1. Fetching latest changes..."
git fetch origin "$BRANCH"

echo ""
echo "2. Pulling changes..."
git pull origin "$BRANCH"

echo ""
echo "3. Installing dependencies..."
npm ci

echo ""
echo "4. Building application..."
npm run build

echo ""
echo "5. Restarting application (zero-downtime)..."
if pm2 describe finance-os-backend > /dev/null 2>&1; then
    pm2 reload ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js --env production
fi

echo ""
echo "6. Saving PM2 process list..."
pm2 save

echo ""
echo "====================================="
echo "Deployment completed successfully!"
echo "====================================="
pm2 status finance-os-backend

echo ""
echo "Health check:"
sleep 2
curl -s http://localhost:3000/api/health || echo "Health check endpoint not responding"
