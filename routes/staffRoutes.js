const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const Staff = require('../models/User');

router.get('/me', verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).select('username');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json({ name: staff.username });
  } catch (err) {
    console.error('Error in /staff/me:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
