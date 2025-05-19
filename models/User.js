const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },   // ✅ required, unique
  password: { type: String, required: true },                 // ✅ required
  role: { 
    type: String, 
    enum: ['admin', 'staff', 'technician'], 
    required: true 
  },                                                          // ✅ role validation
  approved: { type: Boolean, default: false },                // ✅ admin can approve
  rejected: { type: Boolean, default: false }                 // ✅ admin can reject
});

module.exports = mongoose.model('User', userSchema);