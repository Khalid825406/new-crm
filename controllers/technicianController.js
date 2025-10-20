const Job = require('../models/Job');
const User = require('../models/User');

exports.getAllUserAchievements = async (req, res) => {
  try {
    // Get only technicians & staff
    const users = await User.find({ role: { $in: ['technician', 'staff'] } });

    const leaderboard = await Promise.all(
      users.map(async (user) => {
        let jobs = [];

        if (user.role === 'technician') {
          // Technician ke jobs
          jobs = await Job.find({ assignedTo: user._id });
        } else if (user.role === 'staff') {
          // Staff ke jobs (createdBy)
          jobs = await Job.find({ createdBy: user._id });
        }


        if (!jobs.length) {
          return {
            technicianId: user._id,
            name: user.username,
            role: user.role,
            assignedJobs: 0,
            completedJobs: 0,
            rejectionRate: '0%',
            avgResponseTimeMins: '0.0',
            avgCompletionTimeMins: '0.0',
            score: 0,
          };
        }

        // ✅ Completed Jobs
        const completedJobs = jobs.filter(
          (j) =>
            j.status?.toLowerCase() === 'completed' ||
            j.statusTimeline?.some((s) => s.status?.toLowerCase() === 'completed')
        );

        // ✅ Rejected Jobs
        const rejectedJobs = jobs.filter(
          (j) =>
            j.status?.toLowerCase() === 'rejected' ||
            j.statusTimeline?.some((s) => s.status?.toLowerCase() === 'rejected')
        );

        // ✅ Response time (Assigned → Accepted/Rejected)
        const responseTimes = jobs
          .map((job) => {
            const assigned = job.statusTimeline?.find(
              (s) => s.status?.toLowerCase() === 'assigned'
            )?.timestamp;
            const acceptedOrRejected = job.statusTimeline?.find(
              (s) =>
                s.status?.toLowerCase() === 'accepted' ||
                s.status?.toLowerCase() === 'rejected'
            )?.timestamp;
            if (assigned && acceptedOrRejected) {
              return (new Date(acceptedOrRejected) - new Date(assigned)) / 60000;
            }
            return null;
          })
          .filter(Boolean);

        // ✅ Work duration (In Progress → Completed)
        const workDurations = jobs
          .map((job) => {
            const start = job.statusTimeline?.find(
              (s) => s.status?.toLowerCase() === 'in progress'
            )?.timestamp;
            const complete = job.statusTimeline?.find(
              (s) => s.status?.toLowerCase() === 'completed'
            )?.timestamp;
            if (start && complete) {
              return (new Date(complete) - new Date(start)) / 60000;
            }
            return null;
          })
          .filter(Boolean);

        const avgResponseTimeMins = responseTimes.length
          ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
          : '0.0';

        const avgCompletionTimeMins = workDurations.length
          ? (workDurations.reduce((a, b) => a + b, 0) / workDurations.length).toFixed(1)
          : '0.0';

        const rejectionRate = jobs.length
          ? ((rejectedJobs.length / jobs.length) * 100).toFixed(1) + '%'
          : '0%';

        // ✅ Score calculation
        let score = 0;
        if (user.role === 'technician') {
          score =
            completedJobs.length * 10 -
            responseTimes.length * 0.5 -
            rejectedJobs.length * 5;
        } else if (user.role === 'staff') {
          score = completedJobs.length * 8 - rejectedJobs.length * 3;
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
          score: Math.max(score, 0),
        };
      })
    );

    const sortedLeaderboard = leaderboard
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    res.status(200).json(sortedLeaderboard);
  } catch (err) {
    console.error('❌ Error in getAllUserAchievements:', err);
    res.status(500).json({
      error: 'Failed to calculate achievements',
      details: err.message,
    });
  }
};
