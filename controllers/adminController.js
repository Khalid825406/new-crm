// controllers/adminController.js
const User = require('../models/User');
const Job = require('../models/Job');
const twilio = require('twilio');

// 🔐 Twilio client setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Get all pending users
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ approved: false, role: { $in: ['staff', 'technician'] } }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve user
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

// Reject (delete) user
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

// 🔹 Get all approved technicians
exports.getAllTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician', approved: true }).select('-password');
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

    job.assignedTo = technicianId;
    job.status = 'Assigned';
    await job.save();

    // ✅ Send WhatsApp Notification
    const messageBody = `👨‍🔧 New Job Assigned!\n\nLocation: ${job.location}\nCustomer: ${job.customerName}\n\nPlease login to view and accept: https://frontcrm-rho.vercel.app/login`;

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${technician.phone}`, // technician.phone should be in E.164 format, e.g., +919999999999
      body: messageBody
    });

    res.json({ message: 'Technician assigned and WhatsApp message sent' });
  } catch (err) {
    console.error('Error assigning technician:', err);
    res.status(500).json({ message: 'Server error' });
  }
};