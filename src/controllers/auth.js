const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }

  return res.json({
    success: true,
    message: 'Connexion réussie',
    token: 'demo-token-binome-b',
    user: {
      email,
      role: 'Chargé Client'
    }
  });
};

module.exports = {
  login
};
