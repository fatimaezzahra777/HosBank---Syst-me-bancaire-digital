const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization || '';

  if (!token.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant ou invalide' });
  }

  return next();
};

module.exports = authMiddleware;


