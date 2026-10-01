// const { users } = require('../models/bankModel');

// const login = (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: 'Email et mot de passe requis'
//     });
//   }

//   const user = users.find((item) => item.email === email);

//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       message: 'Utilisateur introuvable'
//     });
//   }

//   if (!['Chargé Client', 'Administrateur'].includes(user.role)) {
//     return res.status(403).json({
//       success: false,
//       message: 'Cet espace est réservé aux équipes de la banque'
//     });
//   }

//   if (user.status !== 'ACTIVE') {
//     return res.status(403).json({
//       success: false,
//       message: 'Ce compte est désactivé'
//     });
//   }

//   if (password !== '123456') {
//     return res.status(401).json({
//       success: false,
//       message: 'Mot de passe incorrect'
//     });
//   }

//   return res.json({
//     success: true,
//     message: 'Connexion réussie',
//     token: `demo-token-${user.id}`,
//     user: {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//       firstName: user.firstName,
//       lastName: user.lastName
//     }
//   });
// };

// module.exports = {
//   login
// };

const { users } = require('../models/bankModel');

const login = (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
	}

	const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
	if (!user || !['Chargé Client', 'Administrateur'].includes(user.role)) {
		return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
	}

	if (user.status !== 'ACTIVE') {
		return res.status(403).json({ success: false, message: 'Ce compte est désactivé' });
	}

	if (password !== '123456') {
		return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
	}

	return res.json({
		success: true,
		message: 'Connexion réussie',
		token: `demo-token-${user.id}`,
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
			firstName: user.firstName,
			lastName: user.lastName
		}
	});
};

module.exports = { login };
