const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products          → list all products (with search, filter, sort, pagination)
// GET /api/products/:id      → get single product with images
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
