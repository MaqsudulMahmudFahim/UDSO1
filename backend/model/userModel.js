const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // allows multiple undefined
    required: function () {
      return this.userType === "admin";
    },
    default: undefined,
    set: function (value) {
      return value || undefined;
    },
  },

  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
    unique: true,
  },
  userType: {
    type: String,
    enum: ["guest", "admin"],
    default: "guest",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ✅ Each user will have their own cart
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      size: {
        type: String,
        default: "S",
      },
    },
  ],

  resetToken: String,

  resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", userSchema);
