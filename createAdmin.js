const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashedPassword = await bcrypt.hash('adminpassword', 10);
  const admin = new User({ username: 'admin', password: hashedPassword, role: 'admin', approved: true });
  await admin.save();
  console.log('Admin created');
  process.exit();
});
