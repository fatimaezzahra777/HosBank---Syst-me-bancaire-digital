const { users } = require('../models/bankModel');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization || '';

  if (!token.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant ou invalide' });
  }

  const realToken = token.replace('Bearer ', '').trim();
  const match = realToken.match(/^demo-token-(\d+)$/);
  const user = match && users.find((item) => item.id === Number(match[1]));

  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }

  req.user = user;
  return next();
};

module.exports = authMiddleware;


