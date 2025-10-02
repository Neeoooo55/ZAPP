const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// All admin routes require admin role
router.use(isAuthenticated, isAdmin);

// Overview stats for dashboard
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      customers,
      tradespeople,
      admins,
      availableTradespeople,
      newSignups7d,
      activeJobs,
      byStatus
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'tradesperson' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'tradesperson', isAvailable: true }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Job.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    const jobsByStatus = byStatus.reduce((acc, cur) => {
      acc[cur._id || 'unknown'] = cur.count;
      return acc;
    }, {});

    res.json({
      success: true,
      overview: {
        users: { total: totalUsers, customers, tradespeople, admins, newSignups7d },
        tradespeople: { available: availableTradespeople },
        jobs: { byStatus: jobsByStatus, active: activeJobs },
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to load admin overview' });
  }
});

// List users (excluding admins by default)
router.get('/users', async (req, res) => {
  try {
    const role = req.query.role;
    const filter = {};
    if (role === 'customer' || role === 'tradesperson' || role === 'admin') {
      filter.role = role;
    }
    // By default, exclude admin users unless role=admin is explicitly requested
    if (!filter.role) {
      filter.role = { $ne: 'admin' };
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ success: false, message: 'Failed to load users' });
  }
});

// List jobs with basic joins
router.get('/jobs', async (req, res) => {
  try {
    const status = req.query.status;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .populate('customerId', 'firstName lastName email')
      .populate('tradespersonId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Admin jobs list error:', error);
    res.status(500).json({ success: false, message: 'Failed to load jobs' });
  }
});

module.exports = router;
