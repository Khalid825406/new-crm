// routes/notification.js
const express = require("express");
const router = express.Router();
const admin = require("../utils/firebaseAdmin"); // ✔️ This should export initialized admin
const { verifyToken } = require("../middleware/authMiddleware");
const User = require("../models/User");

router.post("/save-fcm-token", verifyToken, async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) return res.status(400).json({ error: "FCM token is required" });

  await User.findByIdAndUpdate(req.user.id, { fcmToken });
  res.json({ success: true, message: "FCM token saved successfully" });
});

module.exports = router;