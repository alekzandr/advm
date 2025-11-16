#!/bin/bash

# ADVM Console - Quick Setup Script
# Run this script to initialize the project and verify everything is ready for deployment

set -e  # Exit on any error

echo "🔮 ADVM Console - Setup Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the advm-console directory."
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""

echo "🧪 Step 2: Running tests..."
npm test -- --run

echo ""
echo "✅ Tests passed!"
echo ""

echo "🏗️  Step 3: Building production bundle..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""

echo "📊 Step 4: Generating file statistics..."
echo ""
echo "Source files:"
find src -type f | wc -l | xargs echo "  Files:"
du -sh src | cut -f1 | xargs echo "  Size:"
echo ""
echo "Build output:"
du -sh dist | cut -f1 | xargs echo "  Size:"
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "  1. Test locally: npm run dev"
echo "  2. Preview build: npm run preview"
echo "  3. Create GitHub repo: https://github.com/new"
echo "  4. Initialize git: git init && git add . && git commit -m 'Initial commit'"
echo "  5. Push to GitHub: git remote add origin <your-repo-url> && git push -u origin main"
echo "  6. Enable GitHub Pages in repo Settings → Pages → Source: GitHub Actions"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
