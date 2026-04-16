const express = require('express');
const {
  getUserProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getPaymentCards,
  createPaymentCard,
  setDefaultPaymentCard,
  deletePaymentCard,
} = require('../controllers/accountController');

const router = express.Router();

// Profile
router.get('/profile', getUserProfile);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', createAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Payment Cards
router.get('/payment-cards', getPaymentCards);
router.post('/payment-cards', createPaymentCard);
router.put('/payment-cards/:id/default', setDefaultPaymentCard);
router.delete('/payment-cards/:id', deletePaymentCard);

module.exports = router;
