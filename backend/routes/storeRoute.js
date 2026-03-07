const express = require("express");
const {
  homeControl,
  categoryControl,
  detailControl,
  getCart,
  addToCart,
  deleteFromCart,
  checkoutCart,
  homeControlCategories,
  searchProducts,
} = require("../controller/storeControl");

const { isLoggedIn } = require("../controller/authControl"); // <-- updated

const storeRoute = express.Router();

storeRoute.get("/", homeControl);
storeRoute.get("/category/:name", categoryControl);
storeRoute.get("/product-detail/:productId", detailControl);

// ✅ Updated middleware here
storeRoute.get("/cart", isLoggedIn, getCart);
storeRoute.post("/cart/add", isLoggedIn, addToCart);
storeRoute.post("/cart/delete/:productId", isLoggedIn, deleteFromCart);
storeRoute.post("/cart/checkout", isLoggedIn, checkoutCart);

storeRoute.get("/categories", homeControlCategories);

storeRoute.get("/search", searchProducts);

storeRoute.get("/test", (req, res) => {
  res.json({ message: "Store route works" });
});

exports.storeRoute = storeRoute;
