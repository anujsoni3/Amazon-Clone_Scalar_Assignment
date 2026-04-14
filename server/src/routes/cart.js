const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// All cart routes operate on the default user (userId = 1)
// GET    /api/cart            → get cart items
// POST   /api/cart            → add item to cart { productId, quantity }
// PUT    /api/cart/:itemId    → update quantity   { quantity }
// DELETE /api/cart/:itemId    → remove item
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);

module.exports = router;
