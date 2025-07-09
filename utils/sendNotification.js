// const admin = require('./firebaseAdmin'); // ⬅️ Use shared initialized instance

// const sendNotification = async (fcmToken, title, body) => {
//   try {
//     const message = {
//       token: fcmToken,
//       notification: {
//         title,
//         body,
//       },
//     };
    
//     const response = await admin.messaging().send(message);
//     console.log("✅ FCM sent:", response);
//   } catch (error) {
//     console.error("❌ FCM Error:", error);
//   }
// };

// module.exports = sendNotification;


const admin = require('./firebaseAdmin');

const sendNotification = async (fcmToken, title, body, options = {}) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          click_action: options.click_action || 'https://frontcrm-kappa.vercel.app/technician/dashboard', // 🔗 Default fallback
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
