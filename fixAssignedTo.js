// fixAssignedTo.js
require('dotenv').config(); // .env file se config le raha

const mongoose = require('mongoose');
const Job = require('./models/Job'); // ✅ Path adjust karna

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const jobs = await Job.find({
      assignedTo: { $in: [null, undefined] },
      "statusTimeline.status": "Assigned"
    });

    console.log(`🔍 Found ${jobs.length} jobs to fix...`);

    for (let job of jobs) {
      const assignedEntry = job.statusTimeline.find(s => s.status === 'Assigned');
      if (assignedEntry?.assignedTo) {
        job.assignedTo = assignedEntry.assignedTo;
        await job.save();
        console.log(`✅ Fixed assignedTo for job ${job._id}`);
      }
    }

    console.log("🎉 All jobs fixed");
    process.exit();
  } catch (err) {
    console.error("❌ Error fixing jobs:", err);
    process.exit(1);
  }
})();
