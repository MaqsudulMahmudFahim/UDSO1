const mongoose = require("mongoose")

const FavSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Fav", FavSchema);