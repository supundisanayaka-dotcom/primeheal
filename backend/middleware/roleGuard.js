const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.userType) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User role not found' });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

module.exports = { requireRole };
