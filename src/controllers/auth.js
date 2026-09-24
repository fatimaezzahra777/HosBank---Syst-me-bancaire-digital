const { users } = require('../models/bankModel');

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }

  const user = users.find((item) => item.email === email);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Utilisateur introuvable'
    });
  }

  if (password !== '123456') {
    return res.status(401).json({
      success: false,
      message: 'Mot de passe incorrect'
    });
  }

  return res.json({
    success: true,
    message: 'Connexion réussie',
    token: 'demo-token-binome-b',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
};

module.exports = {
  login
};
