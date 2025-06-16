const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const jobController = require('../controllers/jobController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Technician start work
router.post(
  '/start-work/:jobId',
  verifyToken,
  authorizeRoles('technician'),
  upload.single('image'),
  jobController.startWork
);

// Technician complete work
router.post(
  '/complete-work/:jobId',
  verifyToken,
  authorizeRoles('technician'),
  upload.single('image'),
  jobController.completeWork
);

module.exports = router;