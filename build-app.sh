#!/bin/bash

# Protrace Desktop App Build Script
# This script builds a complete desktop application with embedded Python backend

set -e  # Exit on any error

echo "🚀 Building Protrace Desktop Application..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build Python Backend
echo -e "${BLUE}📦 Step 1: Building Python Backend...${NC}"
conda run -n CapsidQuantify-env pyinstaller protrace-backend.spec
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Python backend built successfully${NC}"
    
    # Copy backend to Tauri binaries
    echo -e "${BLUE}📋 Copying backend to Tauri binaries...${NC}"
    cp dist/protrace-backend src-tauri/binaries/protrace-backend-aarch64-apple-darwin
    echo -e "${GREEN}✅ Backend copied to Tauri binaries${NC}"
else
    echo -e "${RED}❌ Failed to build Python backend${NC}"
    exit 1
fi

# Step 2: Build Next.js Frontend
echo -e "${BLUE}🌐 Step 2: Building Next.js Frontend...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build frontend${NC}"
    exit 1
fi

# Step 3: Build Tauri Desktop App
echo -e "${BLUE}🖥️  Step 3: Building Tauri Desktop App...${NC}"
source "$HOME/.cargo/env"
npx @tauri-apps/cli build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Desktop app built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build desktop app${NC}"
    exit 1
fi

# Step 4: Show build results
echo -e "${BLUE}📋 Build Results:${NC}"
echo "🎯 Desktop App: $(pwd)/src-tauri/target/release/bundle/macos/protrace.app"
echo "📦 DMG (if created): $(pwd)/src-tauri/target/release/bundle/dmg/"

echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo -e "${BLUE}📱 You can now run the desktop app by double-clicking protrace.app${NC}"
echo -e "${BLUE}📝 The app includes your Next.js frontend and Python backend all in one package${NC}"
