const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/jobs';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

/**
 * Job create route - admin and staff can create jobs
 */
router.post('/jobs', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      workType,
      reason,
      datetime,
      location,
      priority,
      remarks
    } = req.body;

    const imagePaths = req.files?.map(file => `/uploads/jobs/${file.filename}`) || [];

    const job = new Job({
      customerName,
      customerPhone,
      workType,
      reason,
      datetime,
      location,
      priority,
      images: imagePaths,
      remarks,
      approved: false,
      rejected: false,
     createdBy: req.user.id,
    });

    await job.save();
    res.status(201).json({ message: 'Job submitted for approval', job });
  } catch (err) {
    console.error('Create Job Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get all pending jobs (admin only)
 */
router.get('/pending-jobs', verifyToken, isAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({ approved: false, rejected: false });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending jobs' });
  }
});

/**
 * Get all jobs (admin only)
 */
router.get('/admin/all-jobs', verifyToken, isAdmin, async (req, res) => {
  try {
  const jobs = await Job.find().populate('createdBy', 'username role');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Approve a job (admin only)
 */
router.post('/admin/jobs/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, {
      approved: true,
      rejected: false
    }, { new: true });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: 'Job approved', job });
  } catch (err) {
    res.status(500).json({ message: 'Error approving job' });
  }
});

/**
 * Reject a job (admin only)
 */
router.post('/admin/jobs/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, {
      approved: false,
      rejected: true
    }, { new: true });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: 'Job rejected', job });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting job' });
  }
});

/**
 * Update job status (approve/reject) admin only
 */
router.patch('/jobs/:id/status', verifyToken, isAdmin, async (req, res) => {
  const { status } = req.body;

  if (!['approve', 'reject'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approve or reject' });
  }

  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      status === 'approve'
        ? { approved: true, rejected: false }
        : { approved: false, rejected: true },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: `Job ${status}d successfully`, job });
  } catch (err) {
    res.status(500).json({ message: 'Error updating job status' });
  }
});

// DELETE job by ID (admin only)
router.delete('/admin/jobs/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: 'Job deleted successfully', job });
  } catch (err) {
    console.error('Delete Job Error:', err);
    res.status(500).json({ message: 'Error deleting job' });
  }
});

/**
 * Get jobs created by logged-in staff user (staff only)
 */
router.get('/jobs/staff/jobs', verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Staff jobs fetch error:', err);
    res.status(500).json({ message: 'Error fetching your jobs' });
  }
});


module.exports = router;