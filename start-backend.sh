#!/bin/bash

# ZAPP Backend Startup Script

echo "🚀 Starting ZAPP Backend..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "Please start MongoDB first:"
    echo "  macOS: brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongod"
    echo "  Or use MongoDB Atlas cloud database"
    echo ""
    exit 1
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No .env file found in backend directory!"
    echo "Creating .env file with default values..."
    cat > backend/.env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/zapp
JWT_SECRET=zapp-jwt-secret-change-in-production-2024
SESSION_SECRET=zapp-session-secret-change-in-production-2024
NODE_ENV=development
EOF
    echo "✅ Created backend/.env file"
    echo ""
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "✅ Starting backend server on port 3000..."
echo "📍 API will be available at http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

