const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const fs = require("fs");
const Product = require("../model/productModel");
const Offer = require("../model/offerModel");
const Order = require("../model/orderModel");
const ArchiveOrder = require("../model/archiveOrderModel");
const Category = require("../model/categoryModel");

// Admin Home Page
const adminHomeControl = async (req, res) => {
  try {
    // Fetch all categories from DB
    const categories = await Category.find().lean();

    const sectionProducts = {};
    for (const cat of categories) {
      const products = await Product.find({ category: cat.name })
        .limit(4)
        .lean();
      sectionProducts[cat.name] = products;
    }

    // Flatten all products into a single array
    const arr = [];
    categories.forEach((cat) => arr.push(...sectionProducts[cat.name]));

    const now = new Date();
    const offers = await Offer.find({ expiry: { $gt: now } }).lean();

    res.json({
      success: true,
      arr,
      offers,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Add Product Page
const adminControl = (req, res) => {
  res.json({
    editing: false,
    product: {},
    user: req.session.user,
  });
};

const submitControl = async (req, res) => {
  try {
    const { name, category, description, price, discountPercent } = req.body;

    const photos = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];

    const categoryArr = Array.isArray(category) ? category : [category];

    const product = new Product({
      name,
      category: categoryArr,
      description,
      price,
      discountPercent: discountPercent || 0,
      photos, // ✅ store multiple
    });

    await product.save();
    res.json({ success: true, message: "Product Added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const getEditControl = (req, res) => {
  const productId = req.params.productId;
  const editing = req.query.editing === "true";

  Product.findById(productId)
    .then((product) => {
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      res.json({
        success: true, // <-- add this
        editing,
        product,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.log("Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    });
};

// Post Edited Product

// const postEditControl = async (req, res) => {
//   try {
//     const { id, name, category, description, price, discountPercent } =
//       req.body;
//     const product = await Product.findById(id);
//     if (!product) return res.status(404).json({ success: false });

//     product.name = name;
//     product.category = Array.isArray(category) ? category : [category];
//     product.description = description;
//     product.price = price;
//     product.discountPercent = discountPercent || 0;

//     // 🔥 append new photos
//     if (req.files && req.files.length > 0) {
//       const newPhotos = req.files.map((f) => `/uploads/${f.filename}`);
//       product.photos.push(...newPhotos);
//     }

//     await product.save();
//     res.json({ success: true, message: "Product Updated" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// };

// Post Edited Product
const postEditControl = async (req, res) => {
  try {
    const { id, name, category, description, price, discountPercent, existingPhotos } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false });

    product.name = name;
    product.category = Array.isArray(category) ? category : [category];
    product.description = description;
    product.price = price;
    product.discountPercent = discountPercent || 0;

    // Handle photos
    let updatedPhotos = [];

    // 1️⃣ Add existing photos that were not removed
    if (existingPhotos) {
      // If single photo, convert to array
      updatedPhotos = Array.isArray(existingPhotos) ? existingPhotos : [existingPhotos];
    }

    // 2️⃣ Append newly uploaded photos
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map((f) => `/uploads/${f.filename}`);
      updatedPhotos.push(...newPhotos);
    }

    // 3️⃣ Save final photos array
    product.photos = updatedPhotos;

    await product.save();
    res.json({ success: true, message: "Product Updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// Delete Product
const deleteControl = (req, res) => {
  Product.findByIdAndDelete(req.params.productId)
    .then(() => res.json({ success: true, message: "Product Deleted" }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ success: false });
    });
};

// Show Offer Page
const getAddOffer = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json({
      success: true,
      categories,
      offer: null,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Add Offer
const postAddOffer = async (req, res) => {
  try {
    const { categories, discountPercent, expiry } = req.body;

    const expiryDate = new Date(expiry);
    if (expiryDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry must be a future date",
      });
    }

    const offer = new Offer({
      categories: Array.isArray(categories) ? categories : [categories],
      discountPercent: Number(discountPercent),
      expiry: expiryDate,
    });

    await offer.save();

    await Product.updateMany(
      { category: { $in: offer.categories } },
      { $set: { discountPercent: offer.discountPercent } },
    );

    res.json({
      success: true,
      message: "Offer Added Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Edit Offer Page
const getEditOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.offerId).lean();
    if (!offer) return res.status(404).json({ success: false });

    const categories = await Category.find().lean();

    res.json({
      success: true,
      categories,
      offer,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Update Offer
const postEditOffer = async (req, res) => {
  try {
    const { id, categories, discountPercent, expiry } = req.body;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    const expiryDate = new Date(expiry);
    if (expiryDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry must be a future date",
      });
    }

    offer.categories = Array.isArray(categories) ? categories : [categories];
    offer.discountPercent = Number(discountPercent);
    offer.expiry = expiryDate;

    await offer.save();

    await Product.updateMany(
      { category: { $in: offer.categories } },
      { $set: { discountPercent: offer.discountPercent } },
    );

    res.json({
      success: true,
      message: "Offer Updated Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Show Orders Page
const getOrdersControl = async (req, res) => {
  try {
    // const orders = await Order.find()
    //   .sort({ date: -1 })
    //   .populate("items.productId")
    //   .lean();

    // res.json({ success: true, orders });
    const orders = await Order.find()
      .sort({ date: -1 })
      .populate("items.productId")
      .lean();

    const pendingCount = orders.filter((o) => o.status === "Pending").length;

    res.json({ success: true, orders, pendingCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Order Badge
const getPendingOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({ status: "Pending" });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false });

    if (order.status === "Pending") {
      const archivedOrder = new ArchiveOrder({
        ...order.toObject(),
        archivedAt: new Date(),
      });

      await archivedOrder.save();
      await Order.findByIdAndDelete(order._id);

      return res.json({ success: true, message: "Order Moved to Archive" });
    }

    order.status = "Pending";
    await order.save();

    res.json({ success: true, status: "Pending" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Get Archive Orders
const getArchiveOrdersControl = async (req, res) => {
  try {
    const orders = await ArchiveOrder.find().sort({ archivedAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Delete Archived Order
const deleteArchiveOrder = async (req, res) => {
  try {
    await ArchiveOrder.findByIdAndDelete(req.params.orderId);
    res.json({ success: true, message: "Archived Order Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Cron-like cleanup for expired offers
const checkOffers = async () => {
  const now = new Date();
  const expiredOffers = await Offer.find({ expiry: { $lte: now } });

  for (const offer of expiredOffers) {
    await Product.updateMany(
      { category: { $in: offer.categories } },
      { $set: { discountPercent: 0 } },
    );

    await Offer.findByIdAndDelete(offer._id);
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json({ success: true, categories });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add new category
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Category name required" });

    const existing = await Category.findOne({ name });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });

    const category = new Category({ name });
    await category.save();

    res.json({ success: true, message: "Category added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Category by ID or Name
const deleteCategory = async (req, res) => {
  const { identifier } = req.params; // can be _id or name

  try {
    let category;

    // Check if identifier is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      category = await Category.findByIdAndDelete(identifier);
    } else {
      // Delete by name if not ObjectId
      category = await Category.findOneAndDelete({ name: identifier });
    }

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
      category,
    });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  adminControl,
  submitControl,
  adminHomeControl,
  getEditControl,
  postEditControl,
  deleteControl,
  checkOffers,
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
};
