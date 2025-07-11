// const admin = require('./firebaseAdmin'); // initialized firebase-admin

// const sendNotification = async (fcmToken, title, body, options = {}) => {
//   try {
//     const message = {
//       token: fcmToken,
//       data: {
//         title,
//         body,
//         click_action: options.click_action || 'https://www.sultanmedical-crm.com/technician/dashboard',
//       },
//     };

//     const response = await admin.messaging().send(message);
//     console.log("✅ FCM data-only message sent:", response);
//   } catch (error) {
//     console.error("❌ FCM Error:", error);
//   }
// };

// module.exports = sendNotification;


const admin = require('./firebaseAdmin'); // initialized firebase-admin

const sendNotification = async (fcmToken, title, body, options = {}) => {
  try {
    const message = {
      token: fcmToken,
      data: {
        title,
        body,
        click_action: options.click_action || '/technician/dashboard', // ✅ RELATIVE path
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ FCM data-only message sent:", response);
  } catch (error) {
    console.error("❌ FCM Error:", error);
  }
};

module.exports = sendNotification;
