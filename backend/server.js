const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const tradespersonRoutes = require('./routes/tradespeople');
const customerRoutes = require('./routes/customers');
const { isAuthenticated, isTradesperson } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'zapp-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/zapp',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch((err) => console.error('✗ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tradespeople', tradespersonRoutes);
app.use('/api/customers', customerRoutes);

// Serve Tradesperson Cooperative Web Portal (Vite build) at /portal if present
const portalDist = path.join(__dirname, '..', 'web-portal', 'dist');
if (fs.existsSync(portalDist)) {
  // Static assets (JS/CSS/images)
  app.use('/portal', express.static(portalDist, { maxAge: '7d', index: false }));

  // HTML entry – gate to authenticated tradespeople only
  app.get(['/portal', '/portal/*'], (req, res, next) => {
    // Only intercept HTML navigation requests
    const acceptsHtml = req.accepts(['html', 'json']) === 'html';
    if (!acceptsHtml) return next();

    return isAuthenticated(req, res, () =>
      isTradesperson(req, res, () => {
        const indexFile = path.join(portalDist, 'index.html');
        if (fs.existsSync(indexFile)) {
          res.sendFile(indexFile);
        } else {
          next();
        }
      })
    );
  });

  console.log('✓ Tradesperson web portal mounted at /portal');
} else {
  console.log('ℹ Tradesperson web portal not built (missing web-portal/dist).');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ZAPP Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
