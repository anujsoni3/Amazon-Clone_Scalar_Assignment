const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./src/routes/products');
const categoryRoutes = require('./src/routes/categories');
const cartRoutes = require('./src/routes/cart');
const orderRoutes = require('./src/routes/orders');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Amazon Clone API is running 🚀' });
});

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ── 404 handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
