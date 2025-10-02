# ZAPP Backend

Backend server for ZAPP - a mobile app for booking tradesperson services.

## Tech Stack

- **Node.js** with Express
- **MongoDB** with Mongoose
- **Session-based authentication** with express-session
- **bcryptjs** for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/zapp
   JWT_SECRET=your-secret-key-change-this-in-production
   SESSION_SECRET=your-session-secret-change-this-in-production
   NODE_ENV=development
   ```

4. Make sure MongoDB is running:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas (update MONGODB_URI in .env)
   ```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Tradesperson Web Portal (/portal)

This repo includes a separate Vite-powered web portal for tradespeople (co-op dashboard). The backend serves the built portal at `/portal` and restricts access to authenticated users with the `tradesperson` role.

Build steps:

1. Install portal dependencies:
   ```bash
   cd ../web-portal
   npm install
   npm run build
   ```

2. Start the backend (from `backend/`):
   ```bash
   npm start
   ```

3. Visit `http://localhost:3000/portal` in your browser.

Notes:
- The backend only mounts the portal if `web-portal/dist` exists.
- Static assets are served from the built folder, while HTML navigation to `/portal` and `/portal/*` requires an authenticated session with role `tradesperson`.
- The portal UI currently uses mock data; you can progressively wire it to existing `/api/tradespeople/*` endpoints.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (customer or tradesperson)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update current user
- `GET /api/auth/status` - Check authentication status

### Customer Routes
- `GET /api/customers/profile` - Get customer profile
- `PUT /api/customers/profile` - Update customer profile
- `POST /api/customers/jobs` - Create a new job
- `GET /api/customers/jobs` - Get all jobs for customer
- `GET /api/customers/jobs/:jobId` - Get specific job
- `POST /api/customers/jobs/:jobId/cancel` - Cancel a job
- `POST /api/customers/jobs/:jobId/review` - Submit a review

### Tradesperson Routes
- `GET /api/tradespeople/available/:trade` - Get available tradespeople
- `GET /api/tradespeople/profile` - Get tradesperson profile
- `PUT /api/tradespeople/profile` - Update tradesperson profile
- `GET /api/tradespeople/jobs` - Get jobs for tradesperson
- `GET /api/tradespeople/jobs/:jobId` - Get specific job
- `POST /api/tradespeople/jobs/:jobId/accept` - Accept a job
- `POST /api/tradespeople/jobs/:jobId/start` - Start a job
- `POST /api/tradespeople/jobs/:jobId/complete` - Complete a job
- `POST /api/tradespeople/jobs/:jobId/decline` - Decline a job

### General Job Routes
- `POST /api/jobs/:jobId/auto-assign` - Auto-assign job to tradespeople

## Database Models

### User
- Handles both customers and tradespeople
- Fields: firstName, lastName, email, password, phone, role, address, trades, businessInfo, rating, etc.

### Job
- Handles job requests and tracking
- Fields: customerId, tradespersonId, category, description, location, status, timeline, review, etc.

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Session stored in MongoDB
- Protected routes with authentication middleware
- Role-based access control (customer/tradesperson)

## Development Notes

- Sessions are stored in MongoDB using connect-mongo
- CORS is enabled for mobile app development
- All sensitive data (passwords) are automatically excluded from API responses
- Jobs are automatically indexed for faster queries

## Testing

You can test the API using tools like:
- Postman
- curl
- Thunder Client (VS Code extension)

Example login request:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Mobile App Configuration

Update the API_BASE_URL in the mobile app (`src/services/api.js`):
- iOS Simulator: `http://localhost:3000/api`
- Android Emulator: `http://10.0.2.2:3000/api`
- Real Device: `http://YOUR_COMPUTER_IP:3000/api`

Find your computer's IP:
- macOS/Linux: `ifconfig | grep "inet "`
- Windows: `ipconfig`
