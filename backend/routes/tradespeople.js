const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { isAuthenticated, isTradesperson } = require('../middleware/auth');

// Get available tradespeople for a specific trade and location
router.get('/available/:trade', async (req, res) => {
  try {
    const { trade } = req.params;
    const { lat, lng } = req.query;

    const query = {
      role: 'tradesperson',
      isAvailable: true,
    };

    // Add trade filter if specified
    if (trade && trade !== 'all') {
      query.trades = { $in: [trade, 'general'] };
    }

    // TODO: Add location-based filtering using lat/lng
    // For now, just return all matching tradespeople

    const tradespeople = await User.find(query)
      .select('-password')
      .limit(20);

    res.json({ 
      success: true, 
      tradespeople 
    });
  } catch (error) {
    console.error('Get available tradespeople error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get tradespeople' 
    });
  }
});

// Get tradesperson profile
router.get('/profile', isAuthenticated, isTradesperson, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ 
      success: true, 
      profile: user.toJSON() 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile' 
    });
  }
});

// Update tradesperson profile
router.put('/profile', isAuthenticated, isTradesperson, async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow changing role or sensitive fields
    delete updates.role;
    delete updates.email;
    delete updates.password;
    delete updates.rating; // Rating is calculated from reviews
    delete updates.completedJobs; // Managed by system

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      profile: user.toJSON() 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// Get jobs for tradesperson (all pending jobs in their trade)
router.get('/jobs', isAuthenticated, isTradesperson, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    // Get jobs that match tradesperson's trades or assigned to them
    const jobs = await Job.find({
      $or: [
        { 
          category: { $in: [...user.trades, 'general'] },
          status: 'pending'
        },
        { 
          tradespersonId: req.session.userId 
        }
      ]
    })
      .populate('customerId', '-password')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      jobs 
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get jobs' 
    });
  }
});

// Get a specific job
router.get('/jobs/:jobId', isAuthenticated, isTradesperson, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('customerId', '-password')
      .populate('tradespersonId', '-password');

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    res.json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get job' 
    });
  }
});

// Accept a job
router.post('/jobs/:jobId/accept', isAuthenticated, isTradesperson, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    if (job.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Job is no longer available' 
      });
    }

    job.tradespersonId = req.session.userId;
    job.status = 'accepted';
    job.timeline.acceptedAt = new Date();
    await job.save();

    await job.populate('customerId', '-password');
    await job.populate('tradespersonId', '-password');

    res.json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Accept job error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept job' 
    });
  }
});

// Start a job
router.post('/jobs/:jobId/start', isAuthenticated, isTradesperson, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      tradespersonId: req.session.userId,
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    if (job.status !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only start accepted jobs' 
      });
    }

    job.status = 'in_progress';
    job.timeline.startedAt = new Date();
    await job.save();

    await job.populate('customerId', '-password');
    await job.populate('tradespersonId', '-password');

    res.json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Start job error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start job' 
    });
  }
});

// Complete a job
router.post('/jobs/:jobId/complete', isAuthenticated, isTradesperson, async (req, res) => {
  try {
    const { actualCost, notes, hoursWorked, fixedAmount } = req.body;

    const job = await Job.findOne({
      _id: req.params.jobId,
      tradespersonId: req.session.userId,
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    if (job.status !== 'in_progress') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only complete jobs in progress' 
      });
    }

    let subtotal, platformFee, total, breakdown, hours;

    // Handle fixed-price jobs
    if (job.pricingType === 'fixed') {
      const fixedPrice = parseFloat(fixedAmount);
      if (!fixedPrice || fixedPrice <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide a valid fixed price amount' 
        });
      }
      
      subtotal = fixedPrice;
      platformFee = subtotal * 0.1;
      total = subtotal + platformFee;
      breakdown = `Fixed price quote`;
      hours = null; // No hours for fixed price
    } 
    // Handle hourly and emergency jobs
    else {
      const hourlyRate = 75;
      hours = parseFloat(hoursWorked) || 1;
      
      if (job.urgency === 'emergency' || job.pricingType === 'emergency_fee') {
        const emergencyFee = 150;
        const hourlyCharge = hourlyRate * hours;
        subtotal = emergencyFee + hourlyCharge;
        platformFee = subtotal * 0.1;
        total = subtotal + platformFee;
        breakdown = `$${emergencyFee} emergency fee + $${hourlyCharge.toFixed(2)} (${hours.toFixed(2)}hrs × $${hourlyRate}/hr)`;
      } else {
        subtotal = hourlyRate * hours;
        platformFee = subtotal * 0.1;
        total = subtotal + platformFee;
        breakdown = `${hours.toFixed(2)}hrs × $${hourlyRate}/hr`;
      }
    }

    job.status = 'completed';
    job.timeline.completedAt = new Date();
    job.actualCost = actualCost || total;
    job.completionDetails = {
      hoursWorked: hours,
      finalCost: {
        subtotal,
        platformFee,
        total,
        breakdown
      },
      notes: notes || (hours ? `Completed in ${hours} hours` : 'Fixed price job completed')
    };
    
    await job.save();

    await job.populate('customerId', '-password');
    await job.populate('tradespersonId', '-password');

    res.json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete job' 
    });
  }
});

// Decline a job
router.post('/jobs/:jobId/decline', isAuthenticated, isTradesperson, async (req, res) => {
  try {
    const { reason } = req.body;

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    if (job.tradespersonId && job.tradespersonId.toString() === req.session.userId) {
      // If tradesperson was assigned, unassign and set back to pending
      job.tradespersonId = null;
      job.status = 'pending';
    } else {
      // Otherwise just mark as declined
      job.status = 'declined';
    }

    if (reason) job.notes = reason;
    await job.save();

    res.json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Decline job error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to decline job' 
    });
  }
});

module.exports = router;

