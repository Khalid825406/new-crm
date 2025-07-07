const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashedPassword = await bcrypt.hash('adminpassword', 10);
  const admin = new User({
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
    approved: true,
    phone: '8206468542' 
  });

  await admin.save();
  console.log('Admin created');
  process.exit();
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});