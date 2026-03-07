const mongoose = require("mongoose");

const archiveOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: Date, default: Date.now },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      size: String,
      quantity: Number,
      price: Number,
      discountPercent: { type: Number, default: 0 },
    },
  ],
  subtotal: Number,
  deliveryFee: Number,
  vat: Number,
  total: Number,
  archivedAt: { type: Date, default: Date.now }, // when it was completed
});

module.exports = mongoose.model("ArchiveOrder", archiveOrderSchema);
