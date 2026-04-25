const multer = require('multer');
const { AppError, INVALID_MIME, FILE_TOO_LARGE } = require('../utils/errors');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG and PDF files are allowed', INVALID_MIME, 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// For Doctor/Clinic uploads
const uploadVerificationDocs = upload.fields([
  { name: 'nationalId', maxCount: 1 },
  { name: 'medicalLicense', maxCount: 1 },
  { name: 'businessDoc', maxCount: 1 }
]);

module.exports = {
  upload,
  uploadVerificationDocs
};
