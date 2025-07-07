// utils/firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service.js');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
