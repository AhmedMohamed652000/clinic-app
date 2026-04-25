const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/user.model');
const { sendError } = require('../utils/response');
const { UNAUTHORIZED, ACCOUNT_SUSPENDED } = require('../utils/errors');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, UNAUTHORIZED, 'Missing or invalid token', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Look up user to get fresh status
    const user = await User.findById(decoded.sub).select('status role');

    if (!user) {
      return sendError(res, UNAUTHORIZED, 'User not found', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, ACCOUNT_SUSPENDED, 'Account suspended', 403);
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    return sendError(res, UNAUTHORIZED, 'Invalid or expired token', 401);
  }
};

module.exports = authenticate;
