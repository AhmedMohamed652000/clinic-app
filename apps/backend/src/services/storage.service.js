const admin = require('../config/firebase');

/**
 * Uploads a file buffer to Firebase Storage
 * @param {string} userId
 * @param {string} documentType
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @returns {Promise<string>} Storage reference path
 */
const uploadDocument = async (userId, documentType, fileBuffer, mimeType) => {
  const bucket = admin.storage().bucket();
  const filePath = `verification-docs/${userId}/${documentType}-${Date.now()}`;
  const file = bucket.file(filePath);

  await file.save(fileBuffer, {
    metadata: { contentType: mimeType },
    resumable: false
  });

  return filePath;
};

/**
 * Generates a short-lived signed URL for a file
 * @param {string} storageRef - The path in the storage bucket
 * @returns {Promise<string>} Signed URL
 */
const getSignedUrl = async (storageRef) => {
  const [url] = await admin
    .storage()
    .bucket()
    .file(storageRef)
    .getSignedUrl({
      action: 'read',
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

  return url;
};

module.exports = {
  uploadDocument,
  getSignedUrl
};
