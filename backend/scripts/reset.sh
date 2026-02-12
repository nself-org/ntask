#!/bin/bash
set -e

echo "🧹 Resetting environment..."

# Navigate to repo root
cd "$(dirname "$0")/../.."

read -p "Delete all data? (y/N) " -n 1 -r
echo
[[ ! $REPLY =~ ^[Yy]$ ]] && exit 1

cd backend && docker-compose down -v
cd .. && rm -rf node_modules frontend/.env* backend/.env

echo "✅ Reset complete! Run ./backend/scripts/bootstrap.sh to set up again."
