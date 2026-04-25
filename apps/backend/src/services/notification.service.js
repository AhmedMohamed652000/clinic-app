const admin = require('../config/firebase');
const sgMail = require('@sendgrid/mail');
const env = require('../config/env');

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

/**
 * Sends a push notification via Firebase Cloud Messaging
 * @param {string} fcmToken
 * @param {string} title
 * @param {string} body
 */
const sendPushNotification = async (fcmToken, title, body) => {
  if (!fcmToken) return;

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body }
    });
  } catch (error) {
    console.error('FCM Error:', error.message);
  }
};

/**
 * Sends an email via SendGrid
 * @param {string} to
 * @param {string} subject
 * @param {string} htmlContent
 */
const sendEmail = async (to, subject, htmlContent) => {
  if (!env.SENDGRID_API_KEY || !env.SENDGRID_FROM_EMAIL) {
    console.warn('SendGrid not configured, skipping email.');
    return;
  }

  try {
    await sgMail.send({
      to,
      from: env.SENDGRID_FROM_EMAIL,
      subject,
      html: htmlContent
    });
  } catch (error) {
    console.error('SendGrid Error:', error.message);
    // Wrap in try/catch as per T022: email failure must not break main flow
  }
};

module.exports = {
  sendPushNotification,
  sendEmail
};
