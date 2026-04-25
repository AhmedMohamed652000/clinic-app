const express = require('express');
const router = express.Router();
const tokenService = require('../../../services/token.service');
const authenticate = require('../../../middleware/auth');
const { sendSuccess } = require('../../../utils/response');

/**
 * @route   POST /api/v1/auth/token/refresh
 * @desc    Rotate refresh token
 * @access  Public
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await tokenService.rotateRefreshToken(refreshToken);
    sendSuccess(res, tokens);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/token/logout
 * @desc    Invalidate refresh token
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    // In a real app, we'd hash and find then set usedAt.
    // For now, we'll use a service method if available or direct model op.
    const RefreshToken = require('../../../models/refresh-token.model');
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await RefreshToken.updateOne({ tokenHash: hash }, { usedAt: new Date() });
    
    sendSuccess(res, null, 200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
