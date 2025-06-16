const Job = require('../models/Job');

exports.newgetAssignedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ assignedTo: req.user.id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assigned jobs' });
  }
};