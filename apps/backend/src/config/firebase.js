const admin = require('firebase-admin');
const fs = require('fs');
const env = require('./env');

try {
  const serviceAccount = JSON.parse(
    fs.readFileSync(env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: env.FIREBASE_STORAGE_BUCKET
  });

  console.log('Firebase Admin initialized');
} catch (error) {
  console.error('Firebase initialization error:', error.message);
  // We don't exit here as some parts of the app might work without firebase
  // but many services will fail later if used.
}

module.exports = admin;
