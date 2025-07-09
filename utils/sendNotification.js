const admin = require('./firebaseAdmin'); // shared initialized admin SDK

const sendNotification = async (fcmToken, title, body, options = {}) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        click_action: options.click_action || 'https://www.sultanmedical-crm.com/technician/dashboard'
      },
      webpush: {
        notification: {
          click_action: options.click_action || 'https://www.sultanmedical-crm.com/technician/dashboard',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ FCM sent:", response);
  } catch (error) {
    console.error("❌ FCM Error:", error);
  }
};

module.exports = sendNotification;