const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  discount: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
  usageCount: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
  expiresAt: { type: Date },
}, { timestamps: true });

promoCodeSchema.index({ status: 1 });

module.exports = mongoose.model('PromoCode', promoCodeSchema);

