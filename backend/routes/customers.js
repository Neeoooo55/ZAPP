const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { isAuthenticated, isCustomer } = require('../middleware/auth');

// Get customer profile
router.get('/profile', isAuthenticated, isCustomer, async (req, res) => {
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

// Update customer profile
router.put('/profile', isAuthenticated, isCustomer, async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow changing role or sensitive fields
    delete updates.role;
    delete updates.email;
    delete updates.password;

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

// Create a new job
router.post('/jobs', isAuthenticated, isCustomer, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      customerId: req.session.userId,
      status: 'pending',
    };

    const job = new Job(jobData);
    await job.save();

    // Populate customer data
    await job.populate('customerId', '-password');

    res.status(201).json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create job' 
    });
  }
});

// Get all jobs for the logged-in customer
router.get('/jobs', isAuthenticated, isCustomer, async (req, res) => {
  try {
    const jobs = await Job.find({ customerId: req.session.userId })
      .populate('tradespersonId', '-password')
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
router.get('/jobs/:jobId', isAuthenticated, isCustomer, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      customerId: req.session.userId,
    })
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

// Cancel a job
router.post('/jobs/:jobId/cancel', isAuthenticated, isCustomer, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      customerId: req.session.userId,
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel this job' 
      });
    }

    job.status = 'cancelled';
    await job.save();

    res.json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel job' 
    });
  }
});

// Submit a review for a completed job
router.post('/jobs/:jobId/review', isAuthenticated, isCustomer, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const job = await Job.findOne({
      _id: req.params.jobId,
      customerId: req.session.userId,
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only review completed jobs' 
      });
    }

    if (job.review && job.review.rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Job already reviewed' 
      });
    }

    // Update job with review
    job.review = {
      rating,
      comment,
      createdAt: new Date(),
    };
    await job.save();

    // Update tradesperson rating and completed jobs count
    if (job.tradespersonId) {
      const tradesperson = await User.findById(job.tradespersonId);
      if (tradesperson) {
        const currentTotal = tradesperson.rating.average * tradesperson.rating.totalReviews;
        tradesperson.rating.totalReviews += 1;
        tradesperson.rating.average = (currentTotal + rating) / tradesperson.rating.totalReviews;
        tradesperson.completedJobs = (tradesperson.completedJobs || 0) + 1;
        await tradesperson.save();
      }
    }

    res.json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit review' 
    });
  }
});

module.exports = router;

