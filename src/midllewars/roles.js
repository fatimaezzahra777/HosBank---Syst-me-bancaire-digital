const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Accès refusé pour ce rôle' });
  }

  return next();
};

module.exports = requireRoles;