const {
  clients,
  accounts,
  cards,
  requests,
  complaints,
  interactions,
  comments,
  users,
  operations
} = require('../models/bankModel');

const getClients = (req, res) => {
  res.json({ success: true, data: clients });
};

const getClientById = (req, res) => {
  const client = clients.find((item) => item.id === Number(req.params.id));

  if (!client) {
    return res.status(404).json({ success: false, message: 'Client introuvable' });
  }

  return res.json({ success: true, data: client });
};

const getClientAccounts = (req, res) => {
  const clientId = Number(req.params.id);
  const result = accounts.filter((account) => account.clientId === clientId);

  res.json({ success: true, data: result });
};

const getClientCards = (req, res) => {
  const clientId = Number(req.params.id);
  const result = cards.filter((card) => card.clientId === clientId);

  res.json({ success: true, data: result });
};

const getClientRequests = (req, res) => {
  const clientId = Number(req.params.id);
  const result = requests.filter((request) => request.clientId === clientId);

  res.json({ success: true, data: result });
};

const getClientComplaints = (req, res) => {
  const clientId = Number(req.params.id);
  const result = complaints.filter((complaint) => complaint.clientId === clientId);

  res.json({ success: true, data: result });
};

const updateRequestStatus = (req, res) => {
  const request = requests.find((item) => item.id === Number(req.params.id));

  if (!request) {
    return res.status(404).json({ success: false, message: 'Demande introuvable' });
  }

  const { status } = req.body;
  const allowedStatus = ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'TRAITEE', 'DEMANDEE'];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide' });
  }

  request.status = status;

  return res.json({ success: true, message: 'Statut de la demande mis à jour', data: request });
};

const createComplaint = (req, res) => {
  const { clientId, subject, description } = req.body;

  if (!clientId || !subject || !description) {
    return res.status(400).json({ success: false, message: 'Données incomplètes' });
  }

  const complaint = {
    id: complaints.length + 1,
    clientId: Number(clientId),
    subject,
    description,
    status: 'OUVERTE',
    createdAt: new Date().toISOString().slice(0, 10),
    treatedAt: null
  };

  complaints.push(complaint);

  return res.status(201).json({ success: true, message: 'Réclamation ouverte', data: complaint });
};

const updateComplaintStatus = (req, res) => {
  const complaint = complaints.find((item) => item.id === Number(req.params.id));

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Réclamation introuvable' });
  }

  const { status } = req.body;
  const allowedStatus = ['OUVERTE', 'EN_COURS', 'TRAITEE', 'REFUSEE'];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide' });
  }

  complaint.status = status;
  complaint.treatedAt = status === 'TRAITEE' ? new Date().toISOString().slice(0, 10) : complaint.treatedAt;

  return res.json({ success: true, message: 'Statut de la réclamation mis à jour', data: complaint });
};

const createComment = (req, res) => {
  const { userId, complaintId, requestId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ success: false, message: 'Informations obligatoires manquantes' });
  }

  const comment = {
    id: comments.length + 1,
    userId: Number(userId),
    complaintId: complaintId ? Number(complaintId) : null,
    requestId: requestId ? Number(requestId) : null,
    content,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  comments.push(comment);

  return res.status(201).json({ success: true, message: 'Commentaire ajouté', data: comment });
};

const getUsers = (req, res) => {
  res.json({ success: true, data: users });
};

const createUser = (req, res) => {
  const { firstName, lastName, email, role, status } = req.body;

  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ success: false, message: 'Informations utilisateur incomplètes' });
  }

  const user = {
    id: users.length + 1,
    firstName,
    lastName,
    email,
    role,
    status: status || 'ACTIVE'
  };

  users.push(user);

  return res.status(201).json({ success: true, message: 'Utilisateur créé', data: user });
};

const updateUser = (req, res) => {
  const user = users.find((item) => item.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
  }

  Object.assign(user, req.body);

  return res.json({ success: true, message: 'Utilisateur modifié', data: user });
};

const updateUserStatus = (req, res) => {
  const user = users.find((item) => item.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Statut requis' });
  }

  user.status = status;

  return res.json({ success: true, message: 'Statut utilisateur mis à jour', data: user });
};

const getAccounts = (req, res) => {
  res.json({ success: true, data: accounts });
};

const updateAccountStatus = (req, res) => {
  const account = accounts.find((item) => item.id === Number(req.params.id));

  if (!account) {
    return res.status(404).json({ success: false, message: 'Compte introuvable' });
  }

  const { status } = req.body;
  const allowed = ['ACTIVE', 'BLOCKED', 'CLOSED'];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide' });
  }

  account.status = status;

  return res.json({ success: true, message: 'Statut compte mis à jour', data: account });
};

const getCards = (req, res) => {
  res.json({ success: true, data: cards });
};

const updateCardStatus = (req, res) => {
  const card = cards.find((item) => item.id === Number(req.params.id));

  if (!card) {
    return res.status(404).json({ success: false, message: 'Carte introuvable' });
  }

  const { status } = req.body;
  const allowed = ['ACTIVE', 'BLOCKED', 'OPPOSITION', 'EXPIRED'];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide' });
  }

  card.status = status;

  return res.json({ success: true, message: 'Statut carte mis à jour', data: card });
};

const getOperations = (req, res) => {
  res.json({ success: true, data: operations });
};

const getActivities = (req, res) => {
  res.json({
    success: true,
    data: {
      totalRequests: requests.length,
      totalComplaints: complaints.length,
      totalInteractions: interactions.length,
      totalOperations: operations.length,
      recentActivities: interactions.slice(0, 5)
    }
  });
};

module.exports = {
  getClients,
  getClientById,
  getClientAccounts,
  getClientCards,
  getClientRequests,
  getClientComplaints,
  updateRequestStatus,
  createComplaint,
  updateComplaintStatus,
  createComment,
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  getAccounts,
  updateAccountStatus,
  getCards,
  updateCardStatus,
  getOperations,
  getActivities
};
