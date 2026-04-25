const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/refresh-token.model');
const env = require('../config/env');
const { AppError, REFRESH_TOKEN_REUSE, INVALID_REFRESH_TOKEN } = require('../utils/errors');

/**
 * Signs a new access token
 * @param {string} userId
 * @param {string} role
 * @param {string} status
 * @returns {string} JWT
 */
const signAccessToken = (userId, role, status) => {
  return jwt.sign(
    { sub: userId, role, status },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generates a random 64-byte refresh token
 * @returns {string} Hex string
 */
const generateRawRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Hashes a raw refresh token
 * @param {string} rawToken
 * @returns {string} SHA-256 hash
 */
const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

/**
 * Saves a new refresh token to the database
 * @param {string} userId
 * @param {string} rawToken
 * @returns {Promise<Object>} Mongoose document
 */
const saveRefreshToken = async (userId, rawToken) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  return await RefreshToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt
  });
};

/**
 * Rotates a refresh token: invalidates the old one and issues a new pair
 * @param {string} rawToken
 * @returns {Promise<Object>} { accessToken, refreshToken }
 */
const rotateRefreshToken = async (rawToken) => {
  const currentHash = hashToken(rawToken);
  const tokenRecord = await RefreshToken.findOne({ tokenHash: currentHash }).populate('userId');

  if (!tokenRecord) {
    throw new AppError('Invalid refresh token', INVALID_REFRESH_TOKEN, 401);
  }

  // Reuse detection
  if (tokenRecord.usedAt) {
    // Revoke ALL tokens for this user
    await RefreshToken.deleteMany({ userId: tokenRecord.userId._id });
    throw new AppError('Refresh token reused', REFRESH_TOKEN_REUSE, 401);
  }

  // Check expiration (TTL index handles deletion, but manual check for safety)
  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError('Refresh token expired', INVALID_REFRESH_TOKEN, 401);
  }

  // Mark current token as used
  tokenRecord.usedAt = new Date();
  await tokenRecord.save();

  // Create new pair
  const newAccessToken = signAccessToken(
    tokenRecord.userId._id.toString(),
    tokenRecord.userId.role,
    tokenRecord.userId.status
  );
  const newRawRefreshToken = generateRawRefreshToken();
  await saveRefreshToken(tokenRecord.userId._id, newRawRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRawRefreshToken
  };
};

module.exports = {
  signAccessToken,
  generateRawRefreshToken,
  saveRefreshToken,
  rotateRefreshToken
};
