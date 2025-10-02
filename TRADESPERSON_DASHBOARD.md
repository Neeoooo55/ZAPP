# Tradesperson Dashboard Implementation

This document describes the new tradesperson dashboard feature added to the ZAPP application.

## Overview

A dedicated dashboard has been added for tradespeople to manage their jobs, track hours, and mark jobs as complete. The application now conditionally displays the appropriate dashboard based on the user's role (customer or tradesperson).

## Features Implemented

### 1. Tradesperson Dashboard Screen (`TradespersonDashboardScreen.js`)

A comprehensive dashboard that allows tradespeople to:

- **View All Jobs**: See pending, active, and completed jobs
- **Accept/Decline Jobs**: Review new job requests and choose to accept or decline
- **Start Jobs**: Mark accepted jobs as in-progress when arriving at the location
- **Complete Jobs**: Mark jobs as complete with:
  - Hours worked tracking
  - Completion notes
  - Automatic calculation of final cost
- **Job Details**: View comprehensive job information including:
  - Customer information
  - Job location and address
  - Job description and requirements
  - Pricing information (hourly rate, fixed price, or emergency fee)
  - Urgency level (standard, urgent, emergency)
  - Job status

### 2. API Enhancements (`api.js`)

Added new API methods for tradesperson job management:

```javascript
tradespeopleAPI.getJobs()          // Get all jobs assigned to tradesperson
tradespeopleAPI.getJob(jobId)      // Get specific job details
tradespeopleAPI.acceptJob(jobId)   // Accept a job request
tradespeopleAPI.startJob(jobId)    // Start working on a job
tradespeopleAPI.completeJob(jobId, data)  // Complete a job with hours and notes
tradespeopleAPI.declineJob(jobId, reason) // Decline a job with optional reason
```

### 3. Navigation Updates (`AppNavigator.js`)

The navigation system now conditionally renders the appropriate dashboard:

- **Customers**: See "Dashboard" tab showing their booked jobs
- **Tradespeople**: See "Jobs" tab showing jobs assigned to them
- Both user types can access Home and Profile screens

### 4. Home Screen Updates (`HomeScreen.js`)

Updated to display context-appropriate actions:

- **Customers**: See "Book Now" button
- **Tradespeople**: See "Join as Tradesperson" button
- **Unauthenticated users**: See both options

## User Flow for Tradespeople

### Job Workflow

1. **Receive Job Request**
   - New jobs appear in the "New Job Requests" section
   - Tradesperson can view all job details
   - Options: Accept or Decline

2. **Accept Job**
   - Job moves to "Active Jobs" section
   - Status changes to "assigned"
   - Can start the job when ready

3. **Start Job**
   - Tap "Start Job" button
   - Status changes to "in_progress"
   - Timer implicitly starts for hour tracking

4. **Complete Job**
   - Tap "Complete Job" button
   - Modal appears to enter:
     - Hours worked (required)
     - Completion notes (optional)
   - Submit to mark job as complete
   - Job moves to "Completed Jobs" section

### Dashboard Sections

#### Statistics Cards
- **Total Jobs**: All jobs ever assigned
- **Active**: Currently in-progress or assigned jobs
- **Completed**: Successfully finished jobs

#### New Job Requests
- Jobs pending acceptance
- Shows customer info, location, and job details
- Accept/Decline actions available

#### Active Jobs
- Jobs that are assigned or in-progress
- "Start Job" button for assigned jobs
- "Complete Job" button for in-progress jobs

#### Completed Jobs
- Historical record of finished work
- Shows hours worked and completion details

## UI Components

### Job Cards

Each job card displays:

- **Header**: 
  - Trade icon and service type
  - Status badge (color-coded)
- **Description**: Brief job description
- **Details Row**: 
  - Date requested
  - Pricing information
  - Urgency level (with special highlighting for emergencies)
- **Customer Info**: Name of the customer
- **Location**: Full address
- **Action Buttons**: Context-dependent based on job status

### Completion Modal

A bottom sheet modal for completing jobs:

- Clean, focused interface
- Number input for hours worked
- Multi-line text input for notes
- Submit button to finalize completion

## Technical Implementation

### State Management

- Uses React hooks (`useState`, `useEffect`, `useCallback`)
- `useFocusEffect` for refreshing data when screen gains focus
- Refresh control for pull-to-refresh functionality

### Error Handling

- Try-catch blocks for all API calls
- User-friendly error alerts
- Graceful fallbacks for missing data

### Styling

- Consistent with existing app design system
- Color-coded status indicators
- Responsive layouts
- Accessible touch targets

## Backend Requirements

The frontend expects the following backend endpoints:

```
GET    /api/tradespeople/jobs              - Get all jobs for tradesperson
GET    /api/tradespeople/jobs/:id          - Get specific job details
POST   /api/tradespeople/jobs/:id/accept   - Accept a job
POST   /api/tradespeople/jobs/:id/decline  - Decline a job
POST   /api/tradespeople/jobs/:id/start    - Start a job
POST   /api/tradespeople/jobs/:id/complete - Complete a job
```

### Expected Job Object Structure

```javascript
{
  _id: string,
  title: string,
  description: string,
  trade: 'plumbing' | 'electrical' | 'hvac' | 'carpentry' | 'painting' | 'general',
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
  urgency: 'standard' | 'urgent' | 'emergency',
  pricing: {
    type: 'hourly' | 'fixed' | 'emergency_fee',
    amount: number
  },
  location: {
    address: {
      street: string,
      city: string,
      state: string,
      zipCode: string
    }
  },
  customerId: {
    firstName: string,
    lastName: string
  },
  timeline: {
    requestedAt: Date
  }
}
```

### Complete Job Request Body

```javascript
{
  hoursWorked: number,      // Required
  completionNotes: string   // Optional
}
```

## Testing Checklist

- [ ] Tradesperson can view all assigned jobs
- [ ] Tradesperson can accept new job requests
- [ ] Tradesperson can decline jobs with a reason
- [ ] Tradesperson can start an assigned job
- [ ] Tradesperson can complete a job with hours tracked
- [ ] Statistics update correctly after job actions
- [ ] Pull-to-refresh works on dashboard
- [ ] Completion modal validates hours input
- [ ] Emergency jobs are highlighted appropriately
- [ ] Navigation switches correctly based on user type
- [ ] All job details display properly

## Future Enhancements

Potential improvements for future iterations:

1. **Real-time Updates**: WebSocket integration for live job updates
2. **Navigation**: Turn-by-turn directions to job location
3. **Photo Upload**: Allow tradespeople to upload before/after photos
4. **Time Tracking**: Automatic timer when job is started
5. **Earnings Dashboard**: Track daily/weekly/monthly earnings
6. **Job History**: Detailed history with filters and search
7. **Customer Chat**: In-app messaging with customers
8. **Break Timer**: Allow pausing work timer for breaks
9. **Material Costs**: Track and add material expenses
10. **Offline Support**: Cache jobs for offline viewing

## Notes

- The dashboard automatically refreshes when the screen comes into focus
- All job actions show confirmation dialogs to prevent accidental actions
- The API base URL is configured in `api.js` and should be updated for production
- Hours worked must be a positive decimal number
- Completion notes are optional but recommended for record-keeping

