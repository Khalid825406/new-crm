
const User = require('../models/User');
const Job = require('../models/Job');
const twilio = require('twilio');


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

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== 'technician') {
      return res.status(400).json({ message: 'Invalid technician' });
    }

    // ✅ Remove old 'Rejected' entries
    job.statusTimeline = job.statusTimeline.filter(entry => entry.status !== 'Rejected');

    job.assignedTo = technicianId;
    job.status = 'Assigned';
    job.assignedAt = new Date();
    job.statusTimeline.push({ status: 'Assigned', timestamp: new Date() });

    await job.save();

    const messageBody = `👨‍🔧 New Job Assigned!\n\nLocation: ${job.location}\nCustomer: ${job.customerName}\n\nPlease login to view and accept: https://frontcrm-kappa.vercel.app/login`;

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${technician.phone}`, 
      body: messageBody
    });

    res.json({ message: 'Technician assigned and WhatsApp message sent' });
  } catch (err) {
    console.error('Error assigning technician:', err);
    res.status(500).json({ message: 'Server error' });
  }
};