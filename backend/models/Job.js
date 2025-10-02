const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tradespersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  urgency: {
    type: String,
    enum: ['standard', 'urgent', 'emergency'],
    default: 'standard',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'declined'],
    default: 'pending',
  },
  pricingType: {
    type: String,
    enum: ['hourly', 'fixed', 'emergency_fee'],
    default: 'hourly',
  },
  estimatedCost: {
    type: Number,
  },
  actualCost: {
    type: Number,
  },
  timeline: {
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    createdAt: Date,
  },
  completionDetails: {
    hoursWorked: Number,
    finalCost: {
      subtotal: Number,
      platformFee: Number,
      total: Number,
      breakdown: String,
    },
    notes: String,
  },
  images: [{
    type: String,
  }],
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
jobSchema.index({ customerId: 1, status: 1 });
jobSchema.index({ tradespersonId: 1, status: 1 });
jobSchema.index({ status: 1, scheduledTime: 1 });

module.exports = mongoose.model('Job', jobSchema);

