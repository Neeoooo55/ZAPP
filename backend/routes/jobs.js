const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

// Auto-assign job to tradesperson (can be called by system)
router.post('/:jobId/auto-assign', isAuthenticated, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // Find available tradespeople for this category
    const tradespeople = await User.find({
      role: 'tradesperson',
      trades: { $in: [job.category, 'general'] },
      isAvailable: true,
    }).limit(5);

    if (tradespeople.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No available tradespeople found' 
      });
    }

    // For now, just return the list
    // In a real app, you might implement matching logic
    res.json({ 
      success: true, 
      tradespeople: tradespeople.map(tp => tp.toJSON()) 
    });
  } catch (error) {
    console.error('Auto-assign error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to auto-assign job' 
    });
  }
});

module.exports = router;

