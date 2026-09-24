const express = require('express');
const { login } = require('../controllers/auth');
const {
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
} = require('../controllers/bankController');

const authMiddleware = require('../midllewars/auth');

const router = express.Router();

router.post('/login', login);
router.use(authMiddleware);

router.get('/clients', getClients);
router.get('/clients/:id', getClientById);
router.get('/clients/:id/accounts', getClientAccounts);
router.get('/clients/:id/cards', getClientCards);
router.get('/clients/:id/requests', getClientRequests);
router.get('/clients/:id/complaints', getClientComplaints);
router.patch('/requests/:id/status', updateRequestStatus);
router.post('/complaints', createComplaint);
router.patch('/complaints/:id/status', updateComplaintStatus);
router.post('/comments', createComment);

router.get('/admin/users', getUsers);
router.post('/admin/users', createUser);
router.patch('/admin/users/:id', updateUser);
router.patch('/admin/users/:id/status', updateUserStatus);
router.get('/admin/accounts', getAccounts);
router.patch('/admin/accounts/:id/status', updateAccountStatus);
router.get('/admin/cards', getCards);
router.patch('/admin/cards/:id/status', updateCardStatus);
router.get('/admin/operations', getOperations);
router.get('/admin/activities', getActivities);

module.exports = router;
