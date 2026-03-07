const express = require("express");
const {
  adminControl,
  submitControl,
  adminHomeControl,
  getEditControl,
  postEditControl,
  deleteControl,
  getAddOffer,
  postAddOffer,
  getEditOffer,
  postEditOffer,
  getOrdersControl,
  updateOrderStatus,
  getArchiveOrdersControl,
  deleteArchiveOrder,
  getCategories,
  addCategory,
  deleteCategory,
  getPendingOrdersCount,
} = require("../controller/adminControl");
const { isAdmin } = require("../controller/authControl");

const adminRoute = express.Router();

// Admin Dashboard
adminRoute.get("/admin-home", isAdmin, adminHomeControl);

// Products
adminRoute.get("/add-product", isAdmin, adminControl);
// adminRoute.post("/add-product", isAdmin, submitControl);
adminRoute.get("/add-product/:productId", isAdmin, getEditControl);
// adminRoute.post("/edit-product", isAdmin, postEditControl);

const upload = require("../middleware/multer");

adminRoute.post("/add-product", upload.array("photos", 5), isAdmin, submitControl);
adminRoute.post("/edit-product", upload.array("photos", 5), isAdmin, postEditControl);
adminRoute.delete("/delete-product/:productId", isAdmin, deleteControl);

// Offers
adminRoute.get("/add-offer", isAdmin, getAddOffer);
adminRoute.post("/add-offer", isAdmin, postAddOffer);
adminRoute.get("/edit-offer/:offerId", isAdmin, getEditOffer);
adminRoute.post("/edit-offer", isAdmin, postEditOffer);

// Orders
adminRoute.get("/orders", isAdmin, getOrdersControl);
adminRoute.post("/orders/status/:orderId", isAdmin, updateOrderStatus);
adminRoute.get("/archive-orders", isAdmin, getArchiveOrdersControl);
adminRoute.delete(
  "/archive-orders/delete/:orderId",
  isAdmin,
  deleteArchiveOrder,
);
adminRoute.get("/pending-count", isAdmin, getPendingOrdersCount);

// Categories
adminRoute.get("/categories", isAdmin, getCategories);
adminRoute.post("/categories", isAdmin, addCategory);

// Delete Category
adminRoute.delete("/categories/:identifier", isAdmin, deleteCategory);

exports.adminRoute = adminRoute;
