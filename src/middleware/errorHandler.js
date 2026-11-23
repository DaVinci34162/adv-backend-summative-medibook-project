// src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`);
  
  // If the error has a specific status code (like our validation errors), use it.
  // Otherwise, default to 500 Internal Server Error.
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;