# ZAPP - Tradesperson Marketplace

A full-stack mobile application for connecting customers with trusted local tradespeople. Built with React Native (Expo) and Node.js backend with MongoDB.

## 🚀 Features

### Customer Features
- **User Authentication**: Secure login and registration
- **Service Booking**: Book plumbing, electrical, HVAC, carpentry, painting, and general services
- **Job Management**: Create, view, track, and cancel jobs
- **Profile Management**: Update personal information and addresses
- **Real-time Updates**: Track job status from request to completion
- **Urgency Levels**: Choose emergency, urgent, or standard service
- **Transparent Pricing**: See upfront costs with 10% platform fee
- **Reviews & Ratings**: Rate completed jobs and tradespeople

### Tradesperson Features
- **Job Dashboard**: View all available and assigned jobs
- **Accept/Decline Jobs**: Choose which jobs to take
- **Job Timer**: Track time spent on each job
- **Job Completion**: Mark jobs complete with hours worked
- **Profile Management**: Update trades, availability, and business info
- **Earnings Tracking**: View completed jobs and statistics

## 📱 Screenshots

[Add screenshots here]

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **State Management**: React Context API
- **API Client**: Axios
- **Icons**: Expo Vector Icons

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Session-based with express-session
- **Password Security**: bcryptjs
- **Session Store**: MongoDB (connect-mongo)

### Web Portal (Tradesperson Co-op)
- **Framework**: React + Vite (in `web-portal/`)
- **Served At**: `http://localhost:3000/portal` once built
- **Access**: Requires authenticated `tradesperson` session

## 📦 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Option 1: Using the Startup Script (Recommended)

1. **Start MongoDB** (if using local installation)
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Start the backend**
   ```bash
   ./start-backend.sh
   ```
   This will:
   - Check MongoDB connection
   - Create .env file if needed
   - Install dependencies
   - Start the backend server

3. **In a new terminal, start the mobile app**
   ```bash
   npm install
   npm start
   ```

4. **Run on your device**
   - **iOS**: Press `i` or `npm run ios`
   - **Android**: Press `a` or `npm run android`
   - **Physical Device**: Scan QR code with Expo Go

### Option 2: Manual Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed step-by-step instructions.

### Build the Web Portal (optional)

To enable the tradesperson cooperative web portal at `/portal`:

```bash
cd web-portal
npm install
npm run build
```

Then start the backend (`cd backend && npm start`) and visit `http://localhost:3000/portal`.

## 🏗 Project Structure

```
ZAPP/
├── backend/                    # Backend server
│   ├── server.js              # Main server file
│   ├── models/                # Mongoose models
│   │   ├── User.js           # User/Tradesperson model
│   │   └── Job.js            # Job model
│   ├── routes/               # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── customers.js     # Customer routes
│   │   ├── tradespeople.js  # Tradesperson routes
│   │   └── jobs.js          # General job routes
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # Auth middleware
│   ├── package.json
│   └── .env                 # Environment variables
│
├── web-portal/               # Tradesperson cooperative web portal (Vite project)
│   ├── package.json         # Portal dependencies and scripts
│   ├── index.html           # SPA entry
│   ├── App.tsx              # Portal app
│   └── (dist/)              # Build output (created by `npm run build`)
│
├── src/                      # Mobile app source
│   ├── components/          # Reusable UI components
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Card.js
│   │   └── LoadingScreen.js
│   ├── screens/            # App screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── BookingScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── TradespersonDashboardScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.js
│   ├── services/           # API integration
│   │   └── api.js         # Axios configuration
│   ├── context/            # React Context
│   │   ├── AuthContext.js
│   │   ├── JobContext.js
│   │   └── TradespeopleContext.js
│   └── styles/             # Global styles
│       ├── colors.js
│       └── globalStyles.js
│
├── App.js                   # App entry point
├── app.json                # Expo config
├── package.json            # Frontend dependencies
├── start-backend.sh        # Backend startup script
├── SETUP_GUIDE.md         # Complete setup instructions
└── MIGRATION_NOTES.md     # AsyncStorage to Backend migration notes
```

## 🔧 Configuration

### Environment Setup

The app connects to your backend server. Make sure to:

1. Start the backend server first (default: `http://localhost:3000`)
2. Update the API URL in `src/services/api.js` based on your setup
3. Ensure your backend allows CORS from mobile app

### Backend Configuration

Update your backend's CORS settings to allow requests from the mobile app:

```javascript
// In your backend server.js
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
```

## 📱 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run eject` - Eject from Expo (not recommended)

## 🎨 Theming

The app uses a custom color scheme defined in `src/styles/colors.js`:

- Primary: `#4F46E5` (Indigo)
- Secondary: `#10B981` (Green)
- Accent: `#F59E0B` (Amber)

To customize, edit the colors file and they'll be reflected throughout the app.

## 🔐 Authentication

The app uses session-based authentication with cookies. Users can:

1. Register as a customer or tradesperson
2. Login with email and password
3. Stay authenticated across app restarts
4. Logout securely

## 📊 Features by Screen

### Home Screen
- Service overview
- How it works section
- Quick booking access
- Statistics display

### Booking Screen
- Service type selection
- Urgency level options
- Location input with address
- Pricing calculator
- Auto-assignment of tradespeople

### Dashboard Screen
- View all jobs
- Filter by status (active/completed)
- Job statistics
- Quick actions (cancel, review)
- Pull to refresh

### Profile Screen
- View/edit personal information
- Manage addresses
- Account settings
- Logout option

## 🐛 Troubleshooting

### Common Issues

1. **Cannot connect to backend**
   - Ensure backend server is running
   - Check API_BASE_URL in `src/services/api.js`
   - For Android emulator, use `10.0.2.2` instead of `localhost`
   - For real devices, use your computer's local IP address

2. **Metro bundler issues**
   ```bash
   # Clear cache and restart
   npm start -- --clear
   ```

3. **Module not found errors**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   ```

4. **iOS build issues**
   ```bash
   # Reset iOS simulator
   xcrun simctl erase all
   ```

## 🚀 Building for Production

### Android APK

1. Configure `app.json` with your Android package name
2. Build the APK:
   ```bash
   expo build:android
   ```

### iOS App

1. Configure `app.json` with your iOS bundle identifier
2. Build the iOS app:
   ```bash
   expo build:ios
   ```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/status` - Check auth status
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update current user

### Customer Routes
- `GET /api/customers/profile` - Get customer profile
- `PUT /api/customers/profile` - Update customer profile
- `POST /api/customers/jobs` - Create new job
- `GET /api/customers/jobs` - Get all customer jobs
- `GET /api/customers/jobs/:id` - Get specific job
- `POST /api/customers/jobs/:id/cancel` - Cancel job
- `POST /api/customers/jobs/:id/review` - Submit review

### Tradesperson Routes
- `GET /api/tradespeople/available/:trade` - Get available tradespeople
- `GET /api/tradespeople/profile` - Get tradesperson profile
- `PUT /api/tradespeople/profile` - Update tradesperson profile
- `GET /api/tradespeople/jobs` - Get jobs for tradesperson
- `POST /api/tradespeople/jobs/:id/accept` - Accept job
- `POST /api/tradespeople/jobs/:id/start` - Start job
- `POST /api/tradespeople/jobs/:id/complete` - Complete job
- `POST /api/tradespeople/jobs/:id/decline` - Decline job

See [backend/README.md](backend/README.md) for detailed API documentation.

## 📝 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [MIGRATION_NOTES.md](MIGRATION_NOTES.md) - AsyncStorage to Backend migration details
- [backend/README.md](backend/README.md) - Backend API documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project overview

## 📝 Future Enhancements

- [ ] Push notifications for job updates
- [ ] Real-time chat with tradespeople
- [ ] Photo upload for job details
- [ ] Payment integration (Stripe)
- [ ] Map view for tradesperson location
- [ ] Advanced search and filters
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Admin dashboard
- [ ] Dark mode support
- [ ] Offline mode with sync

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@zapp.com

## 🎯 Notes

- This is an MVP (Minimum Viable Product) focused on core functionality
- Backend server must be running for the app to work
- Designed for both iOS and Android platforms
- Built with scalability in mind

---

**Built with ❤️ using Expo and React Native**
