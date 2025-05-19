// controllers/adminController.js
const User = require('../models/User');

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

