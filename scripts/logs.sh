#!/bin/bash

# Finance OS Backend - Logs Script
# Usage: ./scripts/logs.sh [lines]
# Example: ./scripts/logs.sh 100

LINES=${1:-50}

echo "Showing last $LINES lines of logs..."
echo ""

pm2 logs finance-os-backend --lines "$LINES"
