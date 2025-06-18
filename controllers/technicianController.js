const Job = require('../models/Job');
const User = require('../models/User');

exports.getTechnicianAchievements = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' });

    const leaderboard = await Promise.all(
      technicians.map(async (tech) => {
        const jobs = await Job.find({ assignedTo: tech._id });

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
        const score = completedJobs.length * 10 - responseTimes.length * 0.5 - rejectedJobs.length * 5;

        return {
          technicianId: tech._id,
          name: tech.username,
          completedJobs: completedJobs.length,
          rejectionRate,
          avgResponseTimeMins,
          avgCompletionTimeMins,
          score
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