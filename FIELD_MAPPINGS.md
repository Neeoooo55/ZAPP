# Backend vs Frontend Field Mappings

This document explains the differences between backend API fields and frontend code to prevent confusion.

## User Fields

### Backend (MongoDB/API Response)
- `role` - User type: 'customer' or 'tradesperson'
- All other fields match

### Frontend (Previously used)
- ~~`userType`~~ ❌ **DEPRECATED** - Use `user.role` instead

## Job Fields

### Backend (MongoDB/API Response)
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (populated),
  tradespersonId: ObjectId (populated),
  category: String,           // 'plumbing', 'electrical', etc.
  description: String,         // Full job description
  location: {
    address: String,          // Full address as string
    coordinates: { lat, lng }
  },
  scheduledTime: Date,
  urgency: String,            // 'normal', 'urgent', 'emergency'
  status: String,             // 'pending', 'accepted', 'in_progress', etc.
  estimatedCost: Number,
  actualCost: Number,
  timeline: {
    requestedAt: Date,
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date
  },
  review: {
    rating: Number,
    comment: String,
    createdAt: Date
  }
}
```

### Frontend (Previously expected)
```javascript
{
  trade: String,              // ❌ Use `category` instead
  title: String,              // ❌ Use first line of `description` instead
  pricing: {                  // ❌ Use `estimatedCost`/`actualCost` instead
    type: String,
    amount: Number
  },
  location: {                 // ⚠️ Address is now a string
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  }
}
```

## Correct Usage Examples

### Displaying Job Category (Trade)
```javascript
// ❌ Wrong
<Text>{job.trade}</Text>

// ✅ Correct
<Text>{job.category}</Text>
```

### Displaying Job Title
```javascript
// ❌ Wrong (field doesn't exist)
<Text>{job.title}</Text>

// ✅ Correct (extract from description)
<Text>{job.description?.split('\n')[0] || 'Job'}</Text>
```

### Displaying Job Cost
```javascript
// ❌ Wrong
<Text>${job.pricing.amount}</Text>

// ✅ Correct
<Text>${job.estimatedCost || job.actualCost || 0}</Text>
```

### Displaying Location
```javascript
// ❌ Wrong (address is not an object anymore)
<Text>{job.location.address.street}, {job.location.address.city}</Text>

// ✅ Correct (address is a string)
<Text>{job.location.address}</Text>
```

### Checking User Role
```javascript
// ❌ Wrong
if (user?.userType === 'customer') { }

// ✅ Correct
if (user?.role === 'customer') { }
```

### Calculating Final Cost for Tradesperson
```javascript
// ❌ Wrong (pricing object doesn't exist)
const cost = job.pricing.type === 'hourly' 
  ? job.pricing.amount * hours 
  : job.pricing.amount;

// ✅ Correct (use urgency level)
const hourlyRate = 75;
const cost = job.urgency === 'emergency'
  ? 150 + (hourlyRate * hours)  // Emergency fee + hourly
  : hourlyRate * hours;           // Just hourly
```

## When Creating Jobs

### From Frontend (BookingScreen)
```javascript
const jobData = {
  category: formData.trade,                    // Map trade -> category
  urgency: formData.urgency,
  description: `${formData.title}\n\n${formData.description}`, // Combine into description
  location: {
    address: `${street}, ${city}, ${state} ${zipCode}`,  // String, not object
    coordinates: { lat, lng }
  },
  scheduledTime: new Date().toISOString(),
  estimatedCost: parseFloat(formData.amount) || 0,  // Use estimatedCost, not pricing
};
```

## Summary of Changes Made

1. ✅ Fixed `user.userType` → `user.role` throughout the app
2. ✅ Fixed `job.trade` → `job.category` in dashboard screens
3. ✅ Fixed `job.title` → extract from `job.description`
4. ✅ Fixed `job.pricing.amount` → `job.estimatedCost` or `job.actualCost`
5. ✅ Fixed `job.location.address.street` → `job.location.address` (string)
6. ✅ Updated registration to send `role` and tradesperson fields properly
7. ✅ Updated cost calculation to use `urgency` instead of `pricing.type`

## Files Modified
- `src/navigation/AppNavigator.js`
- `src/screens/RegisterScreen.js`
- `src/screens/ProfileScreen.js`
- `src/screens/HomeScreen.js`
- `src/screens/DashboardScreen.js`
- `src/screens/TradespersonDashboardScreen.js`
- `src/screens/BookingScreen.js` (already correct)

