const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const accountRoutes = require('./routes/account');
const errorHandler = require('./middleware/errorHandler');
const { createRateLimiter } = require('./middleware/rateLimiter');
const { initSocket } = require('./lib/socket');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.set('trust proxy', 1);

const apiLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 200,
  message: 'Too many API requests. Please slow down and retry in a minute.',
});

const writeLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 40,
  message: 'Too many write operations. Please try again shortly.',
});

const checkoutLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  message: 'Too many checkout attempts. Please retry after a short wait.',
});

app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Amazon Clone API is running 🚀' });
});

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', writeLimiter, cartRoutes);
app.use('/api/orders', checkoutLimiter, orderRoutes);
app.use('/api/wishlist', writeLimiter, wishlistRoutes);
app.use('/api/reviews', writeLimiter, reviewRoutes);
app.use('/api/account', writeLimiter, accountRoutes);

// ── 404 handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────
app.use(errorHandler);

const DEFAULT_PORT = parseInt(process.env.PORT || '5000', 10);
const MAX_PORT_RETRIES = 5;

const startServer = (port, attempt = 0) => {
  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    const canRetry = err.code === 'EADDRINUSE' && attempt < MAX_PORT_RETRIES;
    if (canRetry) {
      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    throw err;
  });
};

startServer(DEFAULT_PORT);

module.exports = app;
