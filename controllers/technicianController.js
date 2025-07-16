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
          jobs = await Job.find({ assignedBy: user._id.toString() });
        }

        const completedJobs = jobs.filter(j =>
          j.status?.toLowerCase() === 'completed' ||
          j.statusTimeline?.some(s => s.status?.toLowerCase() === 'completed')
        );

        const rejectedJobs = jobs.filter(j =>
          j.status?.toLowerCase() === 'rejected' ||
          j.statusTimeline?.some(s => s.status?.toLowerCase() === 'rejected')
        );

        const responseTimes = jobs.map((job) => {
          const assigned = job.statusTimeline?.find(s => s.status === 'Assigned')?.timestamp;
          const acceptedOrRejected = job.statusTimeline?.find(s =>
            s.status === 'Accepted' || s.status === 'Rejected')?.timestamp;
          return assigned && acceptedOrRejected
            ? (new Date(acceptedOrRejected) - new Date(assigned)) / 60000
            : null;
        }).filter(Boolean);

        const workDurations = jobs.map((job) => {
          const start = job.statusTimeline?.find(s => s.status === 'In Progress')?.timestamp;
          const complete = job.statusTimeline?.find(s => s.status === 'Completed')?.timestamp;
          return start && complete
            ? (new Date(complete) - new Date(start)) / 60000
            : null;
        }).filter(Boolean);

        const avgResponseTimeMins = responseTimes.length
          ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
          : '0.0';

        const avgCompletionTimeMins = workDurations.length
          ? (workDurations.reduce((a, b) => a + b, 0) / workDurations.length).toFixed(1)
          : '0.0';

        const rejectionRate = jobs.length
          ? ((rejectedJobs.length / jobs.length) * 100).toFixed(1) + '%'
          : '0%';

        let score = 0;
        if (user.role === 'technician') {
          score = completedJobs.length * 10 - responseTimes.length * 0.5 - rejectedJobs.length * 5;
        } else {
          score = jobs.length * 5 - rejectedJobs.length * 3;
        }

        return {
          technicianId: user._id,
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

    const sortedLeaderboard = leaderboard
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    res.json(sortedLeaderboard);
  } catch (err) {
    console.error("❌ Error in getAllUserAchievements:", err);
    res.status(500).json({ error: 'Failed to calculate achievements', details: err.message });
  }
};