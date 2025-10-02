const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tradesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Under Review', 'Resolved'], default: 'Open' },
  openedDate: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: Date.now },
}, { timestamps: true });

disputeSchema.index({ status: 1, lastUpdate: -1 });

module.exports = mongoose.model('Dispute', disputeSchema);

