const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'] },
  aiAnalysis: {
    urgency: String,
    department: String,
    autoResponse: String,
    summary: String
  },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
