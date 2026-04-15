/**
 * Global error handler middleware.
 * Catches errors thrown anywhere in the app and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const isDbUnavailable = String(err?.message || '').includes("Can't reach database server") || String(err?.message || '').includes('P1001');
  if (isDbUnavailable) {
    return res.status(503).json({
      success: false,
      error: 'Database temporarily unavailable. Please try again in a moment.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
