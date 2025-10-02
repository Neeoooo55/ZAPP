const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['Payment', 'Payout', 'Refund'], required: true },
  amount: { type: Number, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Pending' },
}, { timestamps: true });

transactionSchema.index({ date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);

