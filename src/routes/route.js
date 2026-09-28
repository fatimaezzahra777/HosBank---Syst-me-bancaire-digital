const express = require('express');
const { login } = require('../controllers/auth');
const {
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
} = require('../controllers/bankController');

const authMiddleware = require('../midllewars/auth');
const requireRoles = require('../midllewars/roles');

const router = express.Router();

router.post('/login', login);
router.use(authMiddleware);
router.use('/admin', requireRoles('Administrateur'));
router.use('/advisors', requireRoles('Chargé Client', 'Administrateur'));
router.use('/clients', requireRoles('Chargé Client', 'Administrateur'));
router.use('/requests', requireRoles('Chargé Client', 'Administrateur'));
router.use('/complaints', requireRoles('Chargé Client', 'Administrateur'));
router.use('/interactions', requireRoles('Chargé Client', 'Administrateur'));
router.use('/comments', requireRoles('Chargé Client', 'Administrateur'));

router.get('/clients', getClients);
router.get('/requests', getRequests);
router.get('/complaints', getComplaints);
router.get('/interactions', getInteractions);
router.get('/advisors', getAdvisors);
router.get('/clients/:id', getClientById);
router.get('/clients/:id/accounts', getClientAccounts);
router.get('/clients/:id/cards', getClientCards);
router.get('/clients/:id/requests', getClientRequests);
router.get('/clients/:id/complaints', getClientComplaints);
router.get('/clients/:id/interactions', getClientInteractions);
router.patch('/requests/:id/status', updateRequestStatus);
router.post('/complaints', createComplaint);
router.patch('/complaints/:id/status', updateComplaintStatus);
router.post('/comments', createComment);

router.get('/admin/users', getUsers);
router.get('/admin/roles', getRoles);
router.patch('/admin/clients/assign', assignClientToAdvisor);
router.post('/admin/users', createUser);
router.patch('/admin/users/:id', updateUser);
router.patch('/admin/users/:id/status', updateUserStatus);
router.get('/admin/accounts', getAccounts);
router.post('/admin/accounts', createAccount);
router.patch('/admin/accounts/:id', updateAccount);
router.patch('/admin/accounts/:id/status', updateAccountStatus);
router.get('/admin/cards', getCards);
router.patch('/admin/cards/:id/status', updateCardStatus);
router.get('/admin/operations', getOperations);
router.get('/admin/transfers', getTransfers);
router.get('/admin/activities', getActivities);

module.exports = router;
