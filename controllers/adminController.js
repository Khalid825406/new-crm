
const User = require('../models/User');
const Job = require('../models/Job');
const twilio = require('twilio');
const sendNotification = require('../utils/sendNotification');


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ approved: false, role: { $in: ['staff', 'technician'] } }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.approved = true;
    await user.save();

    res.json({ message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.rejectUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.rejected = true;       
    user.approved = false;
    await user.save();

    res.json({ message: 'User rejected successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};


exports.getAllTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: { $in: ['technician', 'staff'] } }).select('-password');
    res.json(technicians);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch technicians' });
  }
};



exports.assignJobToTechnician = async (req, res) => {
  const { jobId, technicianId } = req.body;
  console.log("🔥 Body received:", req.body);

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("❌ Job not found");
      return res.status(404).json({ message: 'Job not found' });
    }

    const assignee = await User.findById(technicianId);
    if (!assignee) {
      console.log("❌ Technician not found");
    } else {
      console.log("👤 Assignee found:", assignee.username);
    }

    if (!assignee || !['technician', 'staff'].includes(assignee.role)) {
      return res.status(400).json({ message: 'Invalid technician or staff' });
    }

    job.statusTimeline = job.statusTimeline.filter(entry => entry.status !== 'Rejected');
    job.assignedTo = technicianId;
    job.status = 'Assigned';
    job.assignedAt = new Date();
    job.statusTimeline.push({ status: 'Assigned', timestamp: new Date() });

    await job.save();
    console.log("✅ Job assigned and saved");

    if (assignee.phone && assignee.phone.startsWith('+')) {
      const messageBody = `👨‍🔧 New Job Assigned!\n\nLocation: ${job.location}\nCustomer: ${job.customerName}\n\nLogin to view: https://frontcrm-kappa.vercel.app/login`;

      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${assignee.phone}`,
        body: messageBody,
      });
      console.log("📤 WhatsApp message sent");
    }

    if (assignee.fcmToken) {
      await sendNotification(
        assignee.fcmToken,
        "🛠️ New Job Assigned",
        `You have a new job for ${job.customerName} at ${job.location}`,
          {
            click_action: "https://www.sultanmedical-crm.com/technician/dashboard" // ✅ APK yahan redirect karega
          }
      );
      console.log("📲 Push notification sent");
    }

    res.json({ message: 'Job assigned successfully' });
  } catch (err) {
    console.error('🔥 Error in assignJobToTechnician:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
