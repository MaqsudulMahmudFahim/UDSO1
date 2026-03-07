const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // Updated: support multiple categories
  category: {
    type: [String], // array of category names
    required: true,
  },

  description: { type: String },
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  // 🔥 MULTIPLE PHOTOS
  photos: {
    type: [String], // array of image paths
    default: [],
  },
});

productSchema.virtual("discountedPrice").get(function () {
  const price = Number(this.price) || 0;
  const discount = Number(this.discountPercent) || 0;
  return (price - (price * discount) / 100).toFixed(2);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
