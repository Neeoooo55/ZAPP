// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ 
    success: false, 
    message: 'Authentication required' 
  });
};

// Middleware to check if user is a customer
exports.isCustomer = (req, res, next) => {
  if (req.session && req.session.userRole === 'customer') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Customer access required' 
  });
};

// Middleware to check if user is a tradesperson
exports.isTradesperson = (req, res, next) => {
  if (req.session && req.session.userRole === 'tradesperson') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Tradesperson access required' 
  });
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.userRole === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Admin access required' 
  });
};
