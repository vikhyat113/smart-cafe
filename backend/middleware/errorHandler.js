/**
 * Catches requests to unknown routes.
 */
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Centralized error handler. Any error passed to next(err), or thrown
 * inside an async route wrapped properly, ends up here.
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  // Multer file size / file type errors
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }

  // Duplicate key errors (e.g. unique email, unique orderId)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Server error' });
}

module.exports = { notFound, errorHandler };
