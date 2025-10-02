# ZAPP Mobile App - Quick Start Guide

This guide will help you get the ZAPP mobile app running in 5 minutes.

## Prerequisites

✅ Node.js installed (v14+)
✅ Backend server running on port 3000
✅ iOS Simulator (Mac) or Android Emulator installed

## Step 1: Install Dependencies

```bash
cd expo_test
npm install
```

## Step 2: Configure Backend URL

**Important:** Update the API URL based on your setup.

Edit `src/services/api.js`:

```javascript
// Line 7-8: Choose the correct URL for your setup

// Option 1: iOS Simulator (Mac)
const API_BASE_URL = 'http://localhost:3000/api';

// Option 2: Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// Option 3: Physical Device (replace with your computer's IP)
const API_BASE_URL = 'http://192.168.1.XXX:3000/api';
```

**Finding your computer's IP:**

Mac/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Windows:
```bash
ipconfig
```

## Step 3: Start Backend Server

In your main project directory (not expo_test):

```bash
cd ..
npm start
```

Backend should be running on `http://localhost:3000`

## Step 4: Start Expo App

In the expo_test directory:

```bash
npm start
```

This will open Expo Dev Tools in your browser.

## Step 5: Run on Device

### iOS Simulator (Mac only)
Press `i` in the terminal

### Android Emulator
Press `a` in the terminal

### Physical Device
1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in terminal/browser
3. Make sure your phone and computer are on the same WiFi network

## Step 6: Test the App

1. **Register a new account**
   - Tap "Sign Up"
   - Choose "Customer" or "Tradesperson"
   - Fill in your details
   - Tap "Sign Up"

2. **Book a service** (Customer)
   - Tap "Book Now" on home screen
   - Select service type (e.g., Plumbing)
   - Choose urgency level
   - Fill in job details
   - Enter address
   - Select pricing type
   - Tap "Book Service"

3. **View your jobs**
   - Tap "Dashboard" in bottom navigation
   - See active and completed jobs
   - Pull down to refresh

4. **Update your profile**
   - Tap "Profile" in bottom navigation
   - Tap edit icon (top right)
   - Update your information
   - Tap "Save Changes"

## Troubleshooting

### Can't connect to backend

1. Check backend is running:
   ```bash
   curl http://localhost:3000/api/auth/status
   ```

2. Update API_BASE_URL in `src/services/api.js`

3. For physical devices, use your computer's IP address

### Metro bundler won't start

```bash
# Clear cache
npm start -- --clear
```

### Module not found errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Android emulator issues

1. Make sure emulator is running before pressing 'a'
2. Use `10.0.2.2` instead of `localhost` in API_BASE_URL

### iOS simulator issues

1. Make sure Xcode is installed
2. Open simulator first, then press 'i'

## Default Test Accounts

If you have seed data in your backend:

**Customer:**
- Email: customer@example.com
- Password: password123

**Tradesperson:**
- Email: tradesperson@example.com
- Password: password123

## Key Features to Test

✅ User Registration (Customer & Tradesperson)
✅ User Login
✅ Browse Services on Home Screen
✅ Book a Service
✅ View Job Dashboard
✅ Update Profile
✅ Logout

## Development Tips

- **Hot Reload**: Edit any file and see changes instantly
- **Debug Menu**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
- **Reload**: Press `r` in terminal
- **Clear Cache**: Press `Shift+r` in terminal

## Next Steps

- Read the full README.md for detailed documentation
- Explore the codebase structure
- Add custom features
- Test on both iOS and Android

## Need Help?

- Check the main README.md
- Review error messages in terminal
- Open an issue on GitHub
- Contact support@zapp.com

---

Happy coding! 🚀

