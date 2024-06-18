#!/bin/bash

# ⚔ Duel of Minds — Quick Setup Script

set -e

echo ""
echo "⚔  Setting up Duel of Minds..."
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌  Node.js is required. Install from https://nodejs.org"
  exit 1
fi

echo "✓  Node.js $(node -v) found"

# Setup server
echo ""
echo "📦  Installing server dependencies..."
cd server
npm install --silent

if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️   Created server/.env from example."
  echo "    👉  Open server/.env and add your GROQ_API_KEY"
  echo "    Get a free key at: https://console.groq.com"
fi

cd ..

# Setup client
echo ""
echo "📦  Installing client dependencies..."
cd client
npm install --silent
cd ..

echo ""
echo "✅  Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  To start:"
echo ""
echo "  Terminal 1 (server):"
echo "    cd server && npm run dev"
echo ""
echo "  Terminal 2 (client):"
echo "    cd client && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
