const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const Job = require('../models/Job');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put('/jobs/:id', upload.array('images'), async (req, res) => {
  const jobId = req.params.id;
  const updates = req.body;

  try {
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'crm_jobs' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        imageUrls.push(result.secure_url);
      }

      updates.images = imageUrls;
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true });

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
});

// ✅ Don't forget this!
module.exports = router;