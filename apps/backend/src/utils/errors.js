class AppError extends Error {
  constructor(message, code, httpStatus = 400) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    Error.captureStackTrace(this, this.constructor);
  }
}

const ErrorCodes = {
  // Authentication Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_FIREBASE_TOKEN: 'INVALID_FIREBASE_TOKEN',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  REFRESH_TOKEN_REUSE: 'REFRESH_TOKEN_REUSE',
  
  // Validation / Input Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PHONE: 'INVALID_PHONE',
  OTP_RATE_LIMIT: 'OTP_RATE_LIMIT',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  
  // File / Document Errors
  MISSING_DOCUMENTS: 'MISSING_DOCUMENTS',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_MIME: 'INVALID_MIME',
  
  // Account Status Errors
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_NOT_PENDING: 'ACCOUNT_NOT_PENDING',
  REASON_REQUIRED: 'REASON_REQUIRED',
  
  // System Errors
  SERVER_ERROR: 'SERVER_ERROR'
};

module.exports = {
  AppError,
  ...ErrorCodes
};
