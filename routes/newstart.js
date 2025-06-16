const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const jobController = require('../controllers/jobController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Technician starts work - uploads image to Cloudinary
router.post(
  '/start-work/:jobId',
  verifyToken,
  authorizeRoles('technician'),
  upload.single('image'), // multer middleware
  jobController.startWork
);

// Technician completes work - uploads image to Cloudinary
router.post(
  '/complete-work/:jobId',
  verifyToken,
  authorizeRoles('technician'),
  upload.single('image'), // multer middleware
  jobController.completeWork
);

module.exports = router;
