const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  workType: { type: String },
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
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Approved', 'Assigned', 'Accepted', 'Rejected', 'In Progress', 'Completed'],
    default: 'Approved',
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  statusTimeline: {
    type: [
      {
        status: {
          type: String,
          enum: ['Assigned', 'Accepted', 'Rejected', 'In Progress', 'Completed'],
        },
        timestamp: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    default: [],
  },
  assignedAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  startWork: {
    image: String,
    remark: String,
    timestamp: Date,
  },
  completion: {
    image: String,
    remark: String,
    timestamp: Date,
  
  },
});

module.exports = mongoose.model('Job', jobSchema);