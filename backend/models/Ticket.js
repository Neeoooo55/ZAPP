const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
  status: { type: String, enum: ['Open', 'InProgress', 'Resolved', 'Closed'], default: 'Open' },
  lastUpdate: { type: Date, default: Date.now },
}, { timestamps: true });

ticketSchema.index({ status: 1, lastUpdate: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);

