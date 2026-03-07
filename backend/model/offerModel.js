const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  categories: [{ type: String, required: true }], // multiple categories
  discountPercent: { type: Number, required: true },
  expiry: { type: Date, required: true }, // deadline
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Offer", offerSchema);
