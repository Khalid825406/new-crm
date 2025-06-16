// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// Protected dashboard route
router.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: `Welcome to ${req.user.role} dashboard`,
    user: req.user.username,
    role: req.user.role
  });
});


module.exports = router;