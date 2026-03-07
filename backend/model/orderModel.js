const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: Date, default: Date.now },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      name: String,
      size: String,
      quantity: Number,
      price: Number,
      discountPercent: { type: Number, default: 0 }
    }
  ],
  subtotal: Number,
  deliveryFee: Number,
  vat: Number,
  total: Number,
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Order", orderSchema);
