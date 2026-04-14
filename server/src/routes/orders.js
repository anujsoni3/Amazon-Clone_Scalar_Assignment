const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders               → place a new order
// GET  /api/orders/history       → get order history for default user
// GET  /api/orders/:orderId      → get a specific order by ID
router.post('/', orderController.placeOrder);
router.get('/history', orderController.getOrderHistory);
router.get('/:orderId', orderController.getOrderById);

module.exports = router;
