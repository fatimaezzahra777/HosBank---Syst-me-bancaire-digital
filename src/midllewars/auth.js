const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization || '';

  if (!token.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant ou invalide' });
  }

  const realToken = token.replace('Bearer ', '').trim();

  if (realToken !== 'demo-token-binome-b') {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }

  return next();
};

module.exports = authMiddleware;


