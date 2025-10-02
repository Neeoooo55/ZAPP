# ZAPP - Complete Setup Guide

This guide will help you set up both the backend server and mobile app for ZAPP.

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Expo CLI** for mobile app development
- **iOS Simulator** (Mac only) or **Android Emulator**

## Part 1: Backend Setup

### 1. Install MongoDB

**Option A: Local MongoDB Installation**
- macOS: `brew install mongodb-community`
- Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Linux: Follow [official docs](https://docs.mongodb.com/manual/administration/install-on-linux/)

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string

### 2. Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```bash
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/zapp
   JWT_SECRET=your-jwt-secret-change-in-production
   SESSION_SECRET=your-session-secret-change-in-production
   NODE_ENV=development
   ```

   If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zapp
   ```

### 3. Start Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on port 3000
```

Test the server:
```bash
curl http://localhost:3000/api/health
```

## Part 2: Mobile App Setup

### 1. Find Your Computer's IP Address

The mobile app needs to connect to your backend server. Find your computer's local IP:

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for your IPv4 address (e.g., `192.168.1.100`)

### 2. Configure API Connection

Open `src/services/api.js` and update the `API_BASE_URL`:

```javascript
// For iOS Simulator (if backend on same machine)
const API_BASE_URL = 'http://localhost:3000/api';

// For Android Emulator (if backend on same machine)
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For Real Device (use your computer's IP)
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
```

Replace `YOUR_COMPUTER_IP` with the IP address you found in step 1.

### 3. Install App Dependencies

From the project root directory:
```bash
npm install
```

### 4. Start the Mobile App

```bash
npm start
```

This will start the Expo development server.

### 5. Run on Device/Simulator

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Physical Device:**
1. Install Expo Go app from App Store or Google Play
2. Scan the QR code shown in the terminal
3. Make sure your phone is on the same WiFi network as your computer

## Part 3: Testing the App

### Create Test Accounts

1. **Register as a Customer:**
   - Open the app
   - Tap "Register"
   - Fill in details
   - Select role: "Customer"
   - Complete registration

2. **Register as a Tradesperson:**
   - Log out (if logged in)
   - Tap "Register"
   - Fill in details
   - Select role: "Tradesperson"
   - Add trade specialties (plumbing, electrical, etc.)
   - Complete registration

### Test Workflow

1. **As Customer:**
   - Log in with customer account
   - Tap "Book Service"
   - Fill in job details
   - Submit booking

2. **As Tradesperson:**
   - Log out and log in with tradesperson account
   - View available jobs
   - Accept a job
   - Start the job (timer begins)
   - Complete the job
   - Enter hours worked and notes

3. **As Customer (again):**
   - Log in with customer account
   - View job status
   - Once completed, leave a review

## Troubleshooting

### Backend Issues

**"MongoDB connection error"**
- Make sure MongoDB is running: `sudo systemctl status mongod` (Linux) or check Activity Monitor (Mac)
- Check your `MONGODB_URI` in `.env`
- For Atlas, verify your IP is whitelisted in Atlas dashboard

**"Port 3000 already in use"**
- Change `PORT` in `.env` to another port (e.g., 3001)
- Update `API_BASE_URL` in the mobile app accordingly

### Mobile App Issues

**"Network request failed"**
- Check that backend server is running
- Verify `API_BASE_URL` in `src/services/api.js`
- Make sure your device/simulator can reach your computer (same network)
- Try pinging your computer's IP from your device

**"Cannot connect to Metro bundler"**
- Restart the Expo server: Press `r` in the terminal
- Clear cache: `expo start -c`

**"Module not found"**
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```

### Testing API Directly

Use curl or Postman to test the backend:

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "1234567890",
    "role": "customer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Architecture Overview

### Backend Structure
```
backend/
├── server.js              # Main server file
├── models/
│   ├── User.js           # User model (customers & tradespeople)
│   └── Job.js            # Job model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── customers.js      # Customer-specific routes
│   ├── tradespeople.js   # Tradesperson-specific routes
│   └── jobs.js           # General job routes
├── middleware/
│   └── auth.js           # Authentication middleware
└── package.json
```

### Frontend Structure
```
src/
├── components/           # Reusable UI components
├── context/             # React Context for state management
│   ├── AuthContext.js   # Authentication state
│   ├── JobContext.js    # Jobs state
│   └── TradespeopleContext.js
├── navigation/          # Navigation configuration
├── screens/             # App screens
├── services/
│   └── api.js          # API configuration and endpoints
└── styles/             # Global styles and colors
```

## Key Features

### Authentication
- Session-based authentication with HTTP-only cookies
- Separate roles for customers and tradespeople
- Password hashing with bcrypt
- Protected routes with middleware

### Job Management
- Create, view, update, and cancel jobs
- Real-time job status tracking
- Accept, start, and complete jobs (tradesperson)
- Submit reviews (customer)

### Data Models
- **User**: Handles both customer and tradesperson profiles
- **Job**: Tracks job lifecycle from creation to completion
- **Session**: Stored in MongoDB for persistence

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use strong secrets for `JWT_SECRET` and `SESSION_SECRET`
3. Enable HTTPS
4. Set up MongoDB Atlas with proper security
5. Deploy to services like Heroku, DigitalOcean, or AWS

### Mobile App
1. Build for production:
   ```bash
   expo build:ios
   expo build:android
   ```
2. Update `API_BASE_URL` to your production backend URL
3. Submit to App Store / Google Play

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for errors
3. Check Expo console for mobile app errors
4. Ensure all dependencies are installed correctly

## License

This project is for educational/demonstration purposes.

