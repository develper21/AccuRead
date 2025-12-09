#!/bin/bash

# AccuRead Project Setup Script (Updated for proper React Native)

echo "🚀 Setting up AccuRead Project..."

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the AccuRead root directory"
    exit 1
fi

# Setup Backend
echo "📦 Setting up Python Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

cd ..

# Setup Frontend (React Native)
echo "📱 Setting up React Native Frontend..."
cd frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "Installing React Native dependencies..."
npm install

# Add iOS dependencies if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Setting up iOS dependencies..."
    cd ios && pod install && cd ..
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Start the backend server:"
echo "   cd backend && source venv/bin/activate && python main.py"
echo ""
echo "2. Start the React Native app:"
echo "   cd frontend && npx react-native run-android  # or run-ios"
echo ""
echo "3. For testing, use the mock endpoint at:"
echo "   http://localhost:8000/mock-extract"
echo ""
echo "📚 Project Structure:"
echo "   ✅ Proper React Native TypeScript project"
echo "   ✅ Industrial dark theme with AR camera"
echo "   ✅ Python FastAPI backend with OCR"
echo "   ✅ All permissions configured"
echo "   ✅ Offline storage and GPS support"
echo ""
echo "🏆 Ready for Hackathon Technical Excellence!"
