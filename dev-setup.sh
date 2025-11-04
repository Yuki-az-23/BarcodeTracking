#!/bin/bash

# Barcode Tracking System - Development Setup Script
# This script sets up the development environment for both frontend and backend

set -e  # Exit on error

echo "🚀 Barcode Tracking System - Development Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js version 20+ required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo ""

# Install API dependencies
echo -e "${BLUE}📦 Installing API dependencies...${NC}"
cd api
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit api/.env with your database credentials${NC}"
fi

npm install
echo -e "${GREEN}✅ API dependencies installed${NC}"
echo ""

# Install App dependencies
echo -e "${BLUE}📦 Installing App dependencies...${NC}"
cd ../app
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example${NC}"
    cp .env.example .env
fi

npm install
echo -e "${GREEN}✅ App dependencies installed${NC}"
echo ""

# Back to root
cd ..

# Database setup check
echo -e "${BLUE}🗄️  Database Setup${NC}"
echo ""
echo "Please ensure PostgreSQL is running and update api/.env with:"
echo "  DATABASE_URL=postgresql://user:password@localhost:5432/barcode_tracker"
echo ""
read -p "Have you configured the database? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Running Prisma migrations...${NC}"
    cd api
    npm run db:generate
    npm run db:push

    echo ""
    read -p "Would you like to seed the database with sample data? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
        echo -e "${GREEN}✅ Database seeded${NC}"
    fi

    cd ..
    echo -e "${GREEN}✅ Database setup complete${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping database setup. Run manually later:${NC}"
    echo "  cd api"
    echo "  npm run db:generate"
    echo "  npm run db:push"
    echo "  npm run db:seed"
fi

echo ""
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}To start development:${NC}"
echo ""
echo "Terminal 1 - Backend API:"
echo "  cd api"
echo "  npm run dev"
echo "  (runs on http://localhost:3000)"
echo ""
echo "Terminal 2 - Frontend App:"
echo "  cd app"
echo "  npm run dev"
echo "  (runs on http://localhost:5173)"
echo ""
echo "Terminal 3 - Mobile (optional):"
echo "  cd app"
echo "  npm run build && npx cap sync"
echo "  npm run android  # or npm run ios"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
