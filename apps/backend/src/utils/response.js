/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {string} code - Application-specific error code
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 */
const sendError = (res, code, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    code,
    message
  });
};

module.exports = {
  sendSuccess,
  sendError
};
