const Job = require('../models/Job');
const User = require('../models/User');

exports.getAllUserAchievements = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['technician', 'staff'] } });
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        let jobs = [];

        if (user.role === 'technician') {
          jobs = await Job.find({ assignedTo: user._id });
        } else if (user.role === 'staff') {
          jobs = await Job.find({ assignedBy: user._id }); // make sure this field exists
        }

        const completedJobs = jobs.filter(j => j.status === 'Completed');
        const rejectedJobs = jobs.filter(j => j.status === 'Rejected');

        const responseTimes = jobs.map(job => {
          const assigned = job.statusTimeline.find(s => s.status === 'Assigned')?.timestamp;
          const acceptedOrRejected = job.statusTimeline.find(s => s.status === 'Accepted' || s.status === 'Rejected')?.timestamp;
          return assigned && acceptedOrRejected ? (new Date(acceptedOrRejected) - new Date(assigned)) / 60000 : null;
        }).filter(Boolean);

        const workDurations = jobs.map(job => {
          const start = job.startWork?.timestamp;
          const complete = job.completion?.timestamp;
          return start && complete ? (new Date(complete) - new Date(start)) / 60000 : null;
        }).filter(Boolean);

        const avgResponseTimeMins = responseTimes.length ? (responseTimes.reduce((a, b) => a + b) / responseTimes.length).toFixed(1) : 0;
        const avgCompletionTimeMins = workDurations.length ? (workDurations.reduce((a, b) => a + b) / workDurations.length).toFixed(1) : 0;
        const rejectionRate = jobs.length ? ((rejectedJobs.length / jobs.length) * 100).toFixed(1) + '%' : '0%';

        // Score formula
        let score;
        if (user.role === 'technician') {
          score = completedJobs.length * 10 - responseTimes.length * 0.5 - rejectedJobs.length * 5;
        } else {
          // Staff ke liye different logic
          score = jobs.length * 5 - rejectedJobs.length * 3;
        }

        return {
          userId: user._id,
          name: user.username,
          role: user.role,
          assignedJobs: jobs.length,
          completedJobs: completedJobs.length,
          rejectionRate,
          avgResponseTimeMins,
          avgCompletionTimeMins,
          score,
        };
      })
    );

    leaderboard.sort((a, b) => b.score - a.score);
    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate achievements' });
  }
};