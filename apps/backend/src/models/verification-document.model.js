const mongoose = require('mongoose');

const verificationDocumentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownerType: {
      type: String,
      enum: ['doctor', 'clinic'],
      required: true
    },
    documentType: {
      type: String,
      required: true
      // e.g. 'national_id', 'medical_license', 'commercial_registration', 'other'
    },
    storageRef: {
      type: String,
      required: true
      // Firebase Storage path
    },
    mimeType: {
      type: String
    },
    fileSizeBytes: {
      type: Number
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Indexes
verificationDocumentSchema.index({ ownerId: 1 });
verificationDocumentSchema.index({ ownerId: 1, ownerType: 1 });

const VerificationDocument = mongoose.model('VerificationDocument', verificationDocumentSchema);

module.exports = VerificationDocument;
