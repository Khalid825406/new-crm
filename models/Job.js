const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  workType: String,
  reason: String,
  datetime: Date,
  location: String,
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  images: [String],
  remarks: String,
  approved: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);