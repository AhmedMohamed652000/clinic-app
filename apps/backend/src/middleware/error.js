const { sendError } = require('../utils/response');
const { SERVER_ERROR } = require('../utils/errors');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let { httpStatus, code, message } = err;

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    httpStatus = 400;
    code = 'FILE_TOO_LARGE';
    message = 'File exceeds 10 MB limit';
  }

  // Fallback for unknown errors
  if (!code) {
    httpStatus = 500;
    code = SERVER_ERROR;
    message = env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred';
    
    if (env.NODE_ENV === 'development') {
      console.error(err);
    }
  }

  sendError(res, code, message, httpStatus);
};

module.exports = errorHandler;
