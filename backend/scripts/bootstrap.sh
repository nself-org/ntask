#!/bin/bash
set -e

echo "🚀 Bootstrapping development environment..."

# Navigate to repo root
cd "$(dirname "$0")/../.."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start services
echo "🐳 Starting Docker services..."
cd backend && docker-compose up -d

echo "⏳ Waiting for services..."
sleep 10

# Create .env files
cd ..
[ ! -f backend/.env ] && cp backend/.env.example backend/.env
[ ! -f frontend/.env.local ] && cp frontend/.env.local.example frontend/.env.local

echo "✅ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "  cd backend && pnpm dev    # (if backend has dev script)"
echo "  cd frontend && pnpm dev   # (or from root: pnpm dev)"
