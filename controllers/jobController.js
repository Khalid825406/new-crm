const Job = require('../models/Job');
const cloudinary = require('../utils/cloudinary');


exports.getAssignedJobsWithStatus = async (req, res) => {
  try {
    const jobs = await Job.find({ assignedTo: { $ne: null } })
      .populate('assignedTo', 'username')
      .sort({ updatedAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

exports.acceptJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.status = 'Accepted';
    job.acceptedAt = new Date();
    job.statusTimeline.push({ status: 'Accepted', timestamp: new Date() });
    await job.save();
    res.json({ message: 'Accepted' });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.status = 'Rejected';
    job.rejectedAt = new Date();
    job.statusTimeline.push({ status: 'Rejected', reason: req.body.reason,timestamp: new Date(), });
    await job.save();
    res.json({ message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['Assigned', 'Accepted', 'Rejected', 'In Progress', 'Completed'];


    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid or missing status value' });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    
    job.status = status;
    job.statusTimeline.push({ status });

    await job.save();

    res.json({ message: 'Status updated successfully', job });
  } catch (err) {
    console.error('Error updating job status:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.startWork = async (req, res) => {
  const { jobId } = req.params;
  const { remarks } = req.body;

  try {
    let imageUrl = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'technician/start',
      });
      imageUrl = result.secure_url;
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: 'In Progress',
        startWork: {
          image: imageUrl,
          remark: remarks,
          timestamp: new Date(),
        },
        $push: {
          statusTimeline: {
            status: 'In Progress',
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json({ message: 'Work started', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Start work failed' });
  }
};



exports.completeWork = async (req, res) => {
  const { jobId } = req.params;
  const { remarks } = req.body;

  try {
    let imageUrl = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'technician/complete',
      });
      imageUrl = result.secure_url;
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: 'Completed',
        completion: {
          image: imageUrl,
          remark: remarks,
          timestamp: new Date(),
        },
        $push: {
          statusTimeline: {
            status: 'Completed',
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json({ message: 'Work completed', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Complete work failed' });
  }
};