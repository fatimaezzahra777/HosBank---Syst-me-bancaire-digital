const {
  clients,
  accounts,
  cards,
  requests,
  complaints,
  interactions,
  comments,
  users,
  operations,
  transfers,
  roles
} = require('../models/bankModel');

const canAccessClient = (req, client) => req.user?.role === 'Administrateur' || client?.assignedAdvisorId === req.user?.id;

const getClients = (req, res) => {
  const result = req.user.role === 'Administrateur' ? clients : clients.filter((client) => client.assignedAdvisorId === req.user.id);
  res.json({ success: true, data: result });
};

const getRequests = (req, res) => {
  const visibleClients = clients.filter((client) => canAccessClient(req, client)).map((client) => client.id);
  res.json({ success: true, data: requests.filter((request) => visibleClients.includes(request.clientId)) });
};

const getComplaints = (req, res) => {
  const visibleClients = clients.filter((client) => canAccessClient(req, client)).map((client) => client.id);
  res.json({ success: true, data: complaints.filter((complaint) => visibleClients.includes(complaint.clientId)) });
};

const getInteractions = (req, res) => {
  const visibleClients = clients.filter((client) => canAccessClient(req, client)).map((client) => client.id);
  res.json({ success: true, data: interactions.filter((interaction) => visibleClients.includes(interaction.clientId)) });
};

const getAdvisors = (req, res) => {
  res.json({ success: true, data: users.filter((user) => user.role === 'Chargé Client' && user.status === 'ACTIVE') });
};

const getClientInteractions = (req, res) => {
  const clientId = Number(req.params.id);
  const client = clients.find((item) => item.id === clientId);
  if (!canAccessClient(req, client)) return res.status(404).json({ success: false, message: 'Client introuvable' });
  const result = interactions.filter((interaction) => interaction.clientId === clientId);
  res.json({ success: true, data: result });
};

const getClientById = (req, res) => {
  const client = clients.find((item) => item.id === Number(req.params.id));

  if (!canAccessClient(req, client)) {
    return res.status(404).json({ success: false, message: 'Client introuvable' });
  }

  return res.json({ success: true, data: client });
};

const getClientAccounts = (req, res) => {
  const clientId = Number(req.params.id);
  const client = clients.find((item) => item.id === clientId);
  if (!canAccessClient(req, client)) return res.status(404).json({ success: false, message: 'Client introuvable' });
  const result = accounts.filter((account) => account.clientId === clientId);

  res.json({ success: true, data: result });
};

const getClientCards = (req, res) => {
  const clientId = Number(req.params.id);
  const client = clients.find((item) => item.id === clientId);
  if (!canAccessClient(req, client)) return res.status(404).json({ success: false, message: 'Client introuvable' });
  const result = cards.filter((card) => card.clientId === clientId);

  res.json({ success: true, data: result });
};

const getClientRequests = (req, res) => {
  const clientId = Number(req.params.id);
  const client = clients.find((item) => item.id === clientId);
  if (!canAccessClient(req, client)) return res.status(404).json({ success: false, message: 'Client introuvable' });
  const result = requests.filter((request) => request.clientId === clientId);

  res.json({ success: true, data: result });
};

const getClientComplaints = (req, res) => {
  const clientId = Number(req.params.id);
  const client = clients.find((item) => item.id === clientId);
  if (!canAccessClient(req, client)) return res.status(404).json({ success: false, message: 'Client introuvable' });
  const result = complaints.filter((complaint) => complaint.clientId === clientId);

  res.json({ success: true, data: result });
};

const updateRequestStatus = (req, res) => {
  const request = requests.find((item) => item.id === Number(req.params.id));

  if (!request) {
    return res.status(404).json({ success: false, message: 'Demande introuvable' });
  }

  if (!canAccessClient(req, clients.find((client) => client.id === request.clientId))) {
    return res.status(404).json({ success: false, message: 'Demande introuvable' });
  }

  const { status, comment } = req.body;
  const transitions = {
    RIB: { EN_ATTENTE: ['ACCEPTEE', 'REFUSEE'] },
    COMPTE_EPARGNE: { EN_ATTENTE: ['ACCEPTEE', 'REFUSEE'] },
    CARTE_VIRTUELLE: { EN_ATTENTE: ['ACCEPTEE', 'REFUSEE'] },
    PIN: { EN_ATTENTE: ['TRAITEE', 'REFUSEE'] },
    OPPOSITION_CARTE: { DEMANDEE: ['TRAITEE'] }
  };
  const allowedStatus = transitions[request.type]?.[request.status] || [];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide' });
  }

  request.status = status;
  request.comment = comment || request.comment;

  if (request.type === 'COMPTE_EPARGNE' && status === 'ACCEPTEE') {
    const id = Math.max(0, ...accounts.map((account) => account.id)) + 1;
    accounts.push({
      id,
      clientId: request.clientId,
      accountNumber: `HB${String(id).padStart(8, '0')}`,
      rib: `RIB${String(id).padStart(10, '0')}`,
      type: 'SAVINGS',
      balance: 0,
      status: 'ACTIVE'
    });
  }

  if (request.type === 'CARTE_VIRTUELLE' && status === 'ACCEPTEE') {
    const id = Math.max(0, ...cards.map((card) => card.id)) + 1;
    cards.push({
      id,
      clientId: request.clientId,
      cardNumber: `4920 0000 0000 ${String(id).padStart(4, '0')}`,
      type: 'VIRTUAL',
      status: 'ACTIVE'
    });
  }

  if (request.type === 'OPPOSITION_CARTE' && status === 'TRAITEE') {
    const card = cards.find((item) => item.clientId === request.clientId && item.status !== 'EXPIRED');
    if (card) card.status = 'OPPOSITION';
  }

  interactions.push({
    id: interactions.length + 1,
    clientId: request.clientId,
    advisorId: req.user.id,
    type: 'DEMANDE',
    description: `Demande ${request.type} ${status.toLowerCase()}`,
    createdAt: new Date().toISOString().slice(0, 10),
    comment: request.comment
  });

  return res.json({ success: true, message: 'Statut de la demande mis à jour', data: request });
};

const createComplaint = (req, res) => {
  const { clientId, subject, description } = req.body;
  const client = clients.find((item) => item.id === Number(clientId));

  if (!client || !canAccessClient(req, client) || !subject || !description) {
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
  interactions.push({
    id: interactions.length + 1,
    clientId: complaint.clientId,
    advisorId: req.user.id,
    type: 'RECLAMATION',
    description: `Réclamation ouverte : ${complaint.subject}`,
    createdAt: complaint.createdAt,
    comment: complaint.description
  });

  return res.status(201).json({ success: true, message: 'Réclamation ouverte', data: complaint });
};

const updateComplaintStatus = (req, res) => {
  const complaint = complaints.find((item) => item.id === Number(req.params.id));

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Réclamation introuvable' });
  }

  if (!canAccessClient(req, clients.find((client) => client.id === complaint.clientId))) {
    return res.status(404).json({ success: false, message: 'Réclamation introuvable' });
  }

  const { status, comment } = req.body;
  const allowedStatus = ['OUVERTE', 'EN_COURS', 'TRAITEE', 'REFUSEE'];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide' });
  }

  complaint.status = status;
  complaint.treatedAt = status === 'TRAITEE' ? new Date().toISOString().slice(0, 10) : complaint.treatedAt;
  interactions.push({
    id: interactions.length + 1,
    clientId: complaint.clientId,
    advisorId: req.user.id,
    type: 'RECLAMATION',
    description: `Réclamation ${status.toLowerCase()} : ${complaint.subject}`,
    createdAt: new Date().toISOString().slice(0, 10),
    comment: comment || ''
  });

  return res.json({ success: true, message: 'Statut de la réclamation mis à jour', data: complaint });
};

const createComment = (req, res) => {
  const { complaintId, requestId, content } = req.body;
  const request = requestId ? requests.find((item) => item.id === Number(requestId)) : null;
  const complaint = complaintId ? complaints.find((item) => item.id === Number(complaintId)) : null;
  const clientId = request?.clientId || complaint?.clientId;

  if (!content || !clientId || !canAccessClient(req, clients.find((client) => client.id === clientId)) || Boolean(requestId) === Boolean(complaintId) || (requestId && !request) || (complaintId && !complaint)) {
    return res.status(400).json({ success: false, message: 'Informations obligatoires manquantes' });
  }

  const comment = {
    id: comments.length + 1,
    userId: req.user.id,
    complaintId: complaintId ? Number(complaintId) : null,
    requestId: requestId ? Number(requestId) : null,
    content,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  comments.push(comment);
  if (request) request.comment = content;
  if (complaint) complaint.response = content;
  if (clientId) {
    interactions.push({
      id: interactions.length + 1,
      clientId,
      advisorId: req.user.id,
      type: 'COMMENTAIRE',
      description: request ? `Réponse à la demande ${request.type}` : `Réponse à la réclamation ${complaint.subject}`,
      createdAt: comment.createdAt,
      comment: comment.content
    });
  }

  return res.status(201).json({ success: true, message: 'Commentaire ajouté', data: comment });
};

const getUsers = (req, res) => {
  res.json({ success: true, data: users });
};

const getRoles = (req, res) => {
  res.json({ success: true, data: roles });
};

const assignClientToAdvisor = (req, res) => {
  const { clientId, advisorId } = req.body;

  if (!clientId || !advisorId) {
    return res.status(400).json({ success: false, message: 'clientId et advisorId sont requis' });
  }

  const client = clients.find((item) => item.id === Number(clientId));
  const advisor = users.find((item) => item.id === Number(advisorId));

  if (!client) {
    return res.status(404).json({ success: false, message: 'Client introuvable' });
  }

  if (!advisor) {
    return res.status(404).json({ success: false, message: 'Chargé client introuvable' });
  }

  if (advisor.role !== 'Chargé Client') {
    return res.status(400).json({ success: false, message: 'L’utilisateur sélectionné n’est pas un chargé client' });
  }

  client.assignedAdvisorId = Number(advisorId);

  return res.json({ success: true, message: 'Client affecté au chargé client', data: client });
};

const createUser = (req, res) => {
  const { firstName, lastName, email, role, status } = req.body;

  if (!firstName || !lastName || !email || !role || !roles.some((item) => item.name === role)) {
    return res.status(400).json({ success: false, message: 'Informations utilisateur incomplètes' });
  }

  if (users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ success: false, message: 'Cette adresse e-mail existe déjà' });
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

  const { firstName, lastName, email, role } = req.body;
  if (email && users.some((item) => item.id !== user.id && item.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ success: false, message: 'Cette adresse e-mail existe déjà' });
  }
  if (role && !roles.some((item) => item.name === role)) {
    return res.status(400).json({ success: false, message: 'Rôle invalide' });
  }
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;

  return res.json({ success: true, message: 'Utilisateur modifié', data: user });
};

const updateUserStatus = (req, res) => {
  const user = users.find((item) => item.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
  }

  const { status } = req.body;
  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut requis' });
  }

  user.status = status;

  return res.json({ success: true, message: 'Statut utilisateur mis à jour', data: user });
};

const getAccounts = (req, res) => {
  res.json({ success: true, data: accounts });
};

const createAccount = (req, res) => {
  const { clientId, type, balance } = req.body;
  const client = clients.find((item) => item.id === Number(clientId));
  const initialBalance = Number(balance || 0);

  if (!client || !['CURRENT', 'SAVINGS'].includes(type) || !Number.isFinite(initialBalance) || initialBalance < 0) {
    return res.status(400).json({ success: false, message: 'Informations de compte invalides' });
  }

  const id = Math.max(0, ...accounts.map((account) => account.id)) + 1;
  const account = {
    id,
    clientId: client.id,
    accountNumber: `HB${String(id).padStart(8, '0')}`,
    rib: `RIB${String(id).padStart(10, '0')}`,
    type,
    balance: initialBalance,
    status: 'ACTIVE'
  };
  accounts.push(account);

  return res.status(201).json({ success: true, message: 'Compte créé', data: account });
};

const updateAccount = (req, res) => {
  const account = accounts.find((item) => item.id === Number(req.params.id));

  if (!account) {
    return res.status(404).json({ success: false, message: 'Compte introuvable' });
  }

  const { clientId, type, balance } = req.body;
  if (clientId !== undefined) {
    const client = clients.find((item) => item.id === Number(clientId));
    if (!client) return res.status(400).json({ success: false, message: 'Client introuvable' });
    account.clientId = client.id;
  }
  if (type !== undefined) {
    if (!['CURRENT', 'SAVINGS'].includes(type)) return res.status(400).json({ success: false, message: 'Type de compte invalide' });
    account.type = type;
  }
  if (balance !== undefined) {
    const nextBalance = Number(balance);
    if (!Number.isFinite(nextBalance) || nextBalance < 0) return res.status(400).json({ success: false, message: 'Solde invalide' });
    account.balance = nextBalance;
  }

  return res.json({ success: true, message: 'Compte modifié', data: account });
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

const getTransfers = (req, res) => {
  res.json({ success: true, data: transfers });
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
  getRequests,
  getComplaints,
  getInteractions,
  getAdvisors,
  getClientInteractions,
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
  getRoles,
  assignClientToAdvisor,
  createUser,
  updateUser,
  updateUserStatus,
  getAccounts,
  createAccount,
  updateAccount,
  updateAccountStatus,
  getCards,
  updateCardStatus,
  getOperations,
  getTransfers,
  getActivities
};
