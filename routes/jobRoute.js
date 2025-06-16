const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Job = require('../models/Job');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'jobs',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

const upload = multer({ storage });

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

    const imagePaths = req.files?.map(file => file.path) || [];

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


router.get('/pending-jobs', verifyToken, isAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({ approved: false, rejected: false });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending jobs' });
  }
});


router.get('/admin/all-jobs', verifyToken, isAdmin, async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'username role');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


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