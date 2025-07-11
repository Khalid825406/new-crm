const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, role, phone } = req.body;

  if (!username || !password || !role || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!['staff', 'technician'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selected' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, phone, role });
    await newUser.save();

    res.status(201).json({ message: 'Registered successfully. Awaiting admin approval.' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role !== 'admin' && !user.approved) {
      return res.status(403).json({ message: 'Account not approved by admin yet.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

   
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkApproval = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ approved: user.approved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


