# Migration from AsyncStorage to Backend Database

## Overview

This document explains the changes made to migrate ZAPP from using AsyncStorage (local storage) to a backend server with MongoDB database.

## What Changed

### Before (AsyncStorage)
- All data stored locally on device
- Data not shared between users
- No real-time updates
- Limited to device capacity
- Data lost if app is uninstalled

### After (Backend + MongoDB)
- Data stored on server
- Real-time synchronization across devices
- Scalable and persistent
- Proper authentication and security
- Multi-user support

## Technical Changes

### Backend (New)

Created a complete backend server:

1. **Server** (`backend/server.js`)
   - Express.js server
   - MongoDB connection
   - Session management
   - CORS configuration

2. **Models** (`backend/models/`)
   - `User.js`: Combined model for customers and tradespeople
   - `Job.js`: Job tracking and management

3. **Routes** (`backend/routes/`)
   - `auth.js`: Authentication (login, register, logout)
   - `customers.js`: Customer-specific operations
   - `tradespeople.js`: Tradesperson-specific operations
   - `jobs.js`: General job operations

4. **Middleware** (`backend/middleware/auth.js`)
   - Authentication checking
   - Role-based access control

### Frontend Changes

#### AuthContext.js
**Before:**
```javascript
// Stored user in AsyncStorage
await AsyncStorage.setItem('current_user', JSON.stringify(user));
```

**After:**
```javascript
// Uses backend API
const data = await authAPI.login(credentials);
// Session managed by backend
```

#### JobContext.js
**Before:**
```javascript
// Stored jobs locally
await AsyncStorage.setItem('shared_jobs', JSON.stringify(jobs));
```

**After:**
```javascript
// Fetches from backend
const data = await customerAPI.getJobs();
setJobs(data.jobs);
```

#### TradespeopleContext.js
**Before:**
```javascript
// Stored tradespeople list locally
await AsyncStorage.setItem('registered_tradespeople', JSON.stringify(tradespeople));
```

**After:**
```javascript
// Fetches from backend
const data = await tradespeopleAPI.getAvailable(trade, lat, lng);
setTradespeople(data.tradespeople);
```

### API Structure

All API calls now go through the backend:

```
Frontend -> axios (src/services/api.js) -> Backend API -> MongoDB
```

### Authentication Flow

**Before:**
1. User enters credentials
2. Check against local AsyncStorage
3. Store user session locally

**After:**
1. User enters credentials
2. Send to backend `/api/auth/login`
3. Backend validates and creates session
4. Session cookie sent to client
5. Subsequent requests include session cookie

### Job Creation Flow

**Before:**
1. Create job object locally
2. Store in AsyncStorage
3. Only visible on current device

**After:**
1. Create job object
2. Send to `/api/customers/jobs`
3. Backend saves to MongoDB
4. Returns created job with ID
5. Visible to all relevant users

### Job Status Updates

**Before:**
```javascript
updateJob(jobId, { status: 'completed' });
// Updates local state and AsyncStorage
```

**After:**
```javascript
await completeJob(jobId, completionData);
// Calls backend API
// Backend updates MongoDB
// Returns updated job
```

## Data Migration

If you had data in AsyncStorage, it will **not** automatically transfer to the new backend. This is a fresh start with the new system.

To preserve old data:
1. Export data from AsyncStorage before migration
2. Manually import into MongoDB after backend setup

## Breaking Changes

1. **User IDs**: New format (MongoDB ObjectIds) vs old Date.now() strings
2. **Job Structure**: Updated to match backend schema
3. **Async Operations**: All context methods are now async
4. **Error Handling**: Different error responses from backend

## Configuration Requirements

### Environment Variables (Backend)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/zapp
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
NODE_ENV=development
```

### API URL Configuration (Frontend)
```javascript
// src/services/api.js
const API_BASE_URL = 'http://YOUR_IP:3000/api';
```

## Benefits of Migration

1. **Data Persistence**: Data survives app reinstallation
2. **Multi-Device**: Access same account from multiple devices
3. **Real-Time**: Changes reflect immediately for all users
4. **Security**: Proper authentication and authorization
5. **Scalability**: Can handle thousands of users
6. **Backup**: Database can be backed up and restored
7. **Analytics**: Can track usage patterns and metrics
8. **Admin Panel**: Can build admin dashboard for management

## Backward Compatibility

**There is NO backward compatibility.** This is a complete architectural change.

- Old AsyncStorage data will not work with new system
- Need to re-register users in new system
- Need to recreate jobs in new system

## Testing

### Before Deployment
1. Test all authentication flows
2. Test job creation and updates
3. Test role-based access (customer vs tradesperson)
4. Test error handling (network issues, invalid data)
5. Test session persistence
6. Test concurrent users

### During Migration
1. Backup any important data
2. Clear app data/cache
3. Test with fresh installs
4. Monitor backend logs
5. Check database for data integrity

## Rollback Plan

If you need to rollback:
1. Keep old AsyncStorage code in git history
2. Revert frontend context files
3. Remove backend dependency
4. Clear any new data
5. Restore from backup if needed

## Performance Considerations

### Network Requests
- More API calls = potential latency
- Implement loading states
- Cache data when appropriate
- Handle offline scenarios

### Optimization Tips
1. Use pagination for large lists
2. Implement pull-to-refresh
3. Cache frequently accessed data
4. Debounce search/filter operations
5. Show optimistic updates

## Security Improvements

1. **Password Hashing**: bcrypt with salt
2. **Session Management**: Secure HTTP-only cookies
3. **Input Validation**: Server-side validation
4. **SQL Injection**: Prevented by Mongoose ORM
5. **CORS**: Configured for specific origins
6. **Rate Limiting**: Can be added to prevent abuse

## Future Enhancements

Now that we have a backend, we can add:
1. Email notifications
2. SMS alerts
3. Payment processing
4. File uploads (job photos)
5. Real-time chat
6. Push notifications
7. Advanced search/filtering
8. Analytics dashboard
9. Admin panel
10. API for third-party integrations

## Maintenance

### Regular Tasks
1. Monitor server health
2. Check database size
3. Review logs for errors
4. Update dependencies
5. Backup database regularly
6. Monitor API performance

### Scaling Considerations
- Add load balancer for multiple servers
- Use MongoDB replica sets
- Implement Redis for session storage
- Add CDN for static assets
- Use database indexing
- Implement caching layer

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [React Context API](https://react.dev/reference/react/useContext)
- [Axios Documentation](https://axios-http.com/docs/intro)

