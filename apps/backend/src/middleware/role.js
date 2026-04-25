const { sendError } = require('../utils/response');
const { FORBIDDEN } = require('../utils/errors');

/**
 * Middleware factory to restrict routes to specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, FORBIDDEN, 'Insufficient permissions', 403);
    }
    next();
  };
};

module.exports = requireRole;
