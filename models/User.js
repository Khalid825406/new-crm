const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, // ✅ Add this
  role: { type: String, enum: ['admin', 'staff', 'technician'], required: true },
  approved: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false }
});


module.exports = mongoose.model('User', userSchema);