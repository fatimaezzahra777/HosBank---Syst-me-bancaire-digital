const roles = [
  { id: 1, name: 'Client' },
  { id: 2, name: 'Chargé Client' },
  { id: 3, name: 'Administrateur' }
];

const users = [
  { id: 1, firstName: 'Fatima', lastName: 'Ali', email: 'fatima@bank.com', role: 'Client', status: 'ACTIVE' },
  { id: 2, firstName: 'Youssef', lastName: 'Benali', email: 'youssef@bank.com', role: 'Client', status: 'ACTIVE' },
  { id: 3, firstName: 'Ahmed', lastName: 'Khaled', email: 'ahmed@bank.com', role: 'Chargé Client', status: 'ACTIVE' },
  { id: 4, firstName: 'Nadia', lastName: 'Said', email: 'nadia@bank.com', role: 'Administrateur', status: 'ACTIVE' }
];

const clients = [
  { id: 1, userId: 1, assignedAdvisorId: 3, fullName: 'Fatima Ali', phone: '0600000001' },
  { id: 2, userId: 2, assignedAdvisorId: 3, fullName: 'Youssef Benali', phone: '0600000002' }
];

const accounts = [
  { id: 1, clientId: 1, accountNumber: 'FR7630001001', rib: '123456789', type: 'CURRENT', balance: 2450.5, status: 'ACTIVE' },
  { id: 2, clientId: 1, accountNumber: 'FR7630001002', rib: '987654321', type: 'SAVINGS', balance: 8500, status: 'ACTIVE' },
  { id: 3, clientId: 2, accountNumber: 'FR7630002001', rib: '456789123', type: 'CURRENT', balance: 3200.75, status: 'ACTIVE' }
];

const cards = [
  { id: 1, clientId: 1, cardNumber: '4920 1111 2222 3333', type: 'VIRTUAL', status: 'ACTIVE' },
  { id: 2, clientId: 2, cardNumber: '4920 4444 5555 6666', type: 'PHYSICAL', status: 'BLOCKED' }
];

const requests = [
  { id: 1, clientId: 1, type: 'RIB', status: 'EN_ATTENTE', createdAt: '2026-09-16', comment: 'Demande de relevé RIB' },
  { id: 2, clientId: 1, type: 'COMPTE_EPARGNE', status: 'ACCEPTEE', createdAt: '2026-09-15', comment: 'Compte épargne créé' },
  { id: 3, clientId: 2, type: 'PIN', status: 'TRAITEE', createdAt: '2026-09-10', comment: 'Nouveau code PIN traité' },
  { id: 4, clientId: 2, type: 'OPPOSITION_CARTE', status: 'DEMANDEE', createdAt: '2026-09-18', comment: 'Opposition demandée' }
];

const complaints = [
  { id: 1, clientId: 1, subject: 'Carte bloquée', description: 'J’ai perdu ma carte et je veux une aide rapide.', status: 'OUVERTE', createdAt: '2026-09-16', treatedAt: null },
  { id: 2, clientId: 2, subject: 'Retard de virement', description: 'Le virement n’a pas été confirmé dans mon compte.', status: 'TRAITEE', createdAt: '2026-09-12', treatedAt: '2026-09-13' }
];

const interactions = [
  { id: 1, clientId: 1, advisorId: 3, type: 'DEMANDE', description: 'Demande RIB acceptée', createdAt: '2026-09-16', comment: 'Votre RIB est disponible.' },
  { id: 2, clientId: 2, advisorId: 3, type: 'RECLAMATION', description: 'Réclamation ouverte sur le virement', createdAt: '2026-09-12', comment: 'Le dossier a été transmis au service concerné.' }
];

const comments = [
  { id: 1, userId: 3, complaintId: 1, requestId: null, content: 'Votre dossier est en cours de traitement.', createdAt: '2026-09-16' },
  { id: 2, userId: 3, complaintId: null, requestId: 1, content: 'Votre RIB est disponible.', createdAt: '2026-09-16' }
];

const operations = [
  { id: 1, type: 'VIREMENT', amount: 250, accountId: 1, status: 'COMPLETED', date: '2026-09-20' },
  { id: 2, type: 'PAIEMENT', amount: 80, accountId: 3, status: 'COMPLETED', date: '2026-09-21' },
  { id: 3, type: 'RETRAIT', amount: 120, accountId: 1, status: 'PENDING', date: '2026-09-22' }
];

module.exports = {
  roles,
  users,
  clients,
  accounts,
  cards,
  requests,
  complaints,
  interactions,
  comments,
  operations
};
