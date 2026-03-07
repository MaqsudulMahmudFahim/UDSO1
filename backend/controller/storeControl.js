const express = require("express");
const product = require("../model/productModel");
const User = require("../model/userModel");
const { checkOffers } = require("../controller/adminControl");
const Offer = require("../model/offerModel");
const Order = require("../model/orderModel");

// HOME
const homeControl = async (req, res, next) => {
  try {
    // Run offer cleanup first
    await checkOffers();

    // Fetch all unique categories
    const sections = await product.distinct("category");

    // Get all active offers
    const now = new Date();
    const activeOffers = await Offer.find({ expiry: { $gt: now } }).lean();

    const sectionProducts = {};

    for (const section of sections) {
      const products = await product.find({ category: section }).lean();

      // Apply discount dynamically if an active offer exists
      products.forEach((p) => {
        // find offer applicable for this product's category
        const offer = activeOffers.find((o) => o.categories.includes(section));
        if (offer) {
          p.discountPercent = offer.discountPercent;
          p.finalPrice = p.price - (p.price * offer.discountPercent) / 100;
        } else {
          p.finalPrice = p.price;
        }
      });

      sectionProducts[section] = products.slice(0, 4); // show max 4 per section
    }

    // Flatten all products into a single array
    const arr = [];
    sections.forEach((section) => arr.push(...sectionProducts[section]));

    res.json({
      products: arr,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error while fetching home page data" });
  }
};

// Category Page
const categoryControl = async (req, res, next) => {
  try {
    await checkOffers();

    const categoryName = req.params.name;

    // Ensure category exists dynamically
    const categories = await product.distinct("category");
    if (!categories.includes(categoryName)) {
      return res.status(404).json({ error: "Category not found" });
    }

    const products = await product
      .find({ category: categoryName })
      .lean({ virtuals: true });

    res.json({
      categoryName,
      products,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching category products" });
  }
};

// Product Detail
const detailControl = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const productData = await product
      .findById(productId)
      .lean({ virtuals: true });

    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      product: productData,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching product details" });
  }
};

// Add Product
const addProduct = async (req, res) => {
  try {
    const price = parseFloat(req.body.price);
    const discountPercent = parseFloat(req.body.discountPercent);

    const finalPrice = isNaN(price) ? 0 : price;
    const finalDiscount = isNaN(discountPercent) ? 0 : discountPercent;

    const newProduct = new product({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: finalPrice,
      discountPercent: finalDiscount,
      photo: req.body.photo,
    });

    await newProduct.save();
    res.json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error adding product" });
  }
};

// Edit Product
const editProduct = async (req, res) => {
  try {
    const price = parseFloat(req.body.price);
    const discountPercent = parseFloat(req.body.discountPercent);

    const finalPrice = isNaN(price) ? 0 : price;
    const finalDiscount = isNaN(discountPercent) ? 0 : discountPercent;

    await product.findByIdAndUpdate(req.body.id, {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: finalPrice,
      discountPercent: finalDiscount,
      photo: req.body.photo,
    });

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating product" });
  }
};

// Show Cart
const getCart = async (req, res) => {
  try {
    if (!req.session.user) return res.json({ redirect: "/login" });

    await checkOffers();

    const user = await User.findById(req.session.user._id).populate(
      "cart.productId",
    );
    if (!user) return res.json({ redirect: "/login" });

    const cartItems = user.cart || [];

    let subtotal = 0;
    cartItems.forEach((item) => {
      const price = Number(item.productId.price) || 0;
      const discount = Number(item.productId.discountPercent) || 0;
      const discountedPrice = price - (price * discount) / 100;
      subtotal += discountedPrice * item.quantity;
    });

    const deliveryFee = subtotal > 0 ? 60 : 0;
    const vat = subtotal * 0.05;
    const total = subtotal + deliveryFee + vat;

    res.json({
      cartItems,
      subtotal,
      deliveryFee,
      vat,
      total,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user cart" });
  }
};

// Add to Cart
const addToCart = async (req, res) => {
  try {
    if (!req.session.user) return res.json({ redirect: "/login" });

    const { productId } = req.body;
    const user = await User.findById(req.session.user._id);
    const productData = await product.findById(productId);

    if (!user || !productData) return res.json({ error: "Invalid product" });

    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ productId, quantity: 1 });
    }

    await user.save();
    res.json({ message: "Added to cart successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error adding to cart" });
  }
};

// Delete from Cart
const deleteFromCart = async (req, res) => {
  try {
    if (!req.session.user) return res.json({ redirect: "/login" });

    const { productId } = req.params;
    const user = await User.findById(req.session.user._id);
    if (!user) return res.json({ redirect: "/login" });

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId,
    );

    await user.save();
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting cart item" });
  }
};

// Checkout
const checkoutCart = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate(
      "cart.productId",
    );
    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const { name, mobile, address } = req.body;
    const date = new Date();

    let subtotal = 0;
    user.cart.forEach((item) => {
      const price = Number(item.productId.price) || 0;
      const discount = Number(item.productId.discountPercent) || 0;
      const discountedPrice = price - (price * discount) / 100;
      subtotal += discountedPrice * item.quantity;
    });

    const deliveryFee = subtotal > 0 ? 60 : 0;
    const vat = subtotal * 0.05;
    const total = subtotal + deliveryFee + vat;

    const newOrder = new Order({
      user: user._id,
      name,
      mobile,
      address,
      items: user.cart.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        discountPercent: item.productId.discountPercent || 0,
      })),
      subtotal,
      deliveryFee,
      vat,
      total,
      date,
    });

    await newOrder.save();

    user.cart = [];
    await user.save();

    res.json({
      message: "Thank you for your order!",
      order: { name, total, date: date.toLocaleString() },
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const Category = require("../model/categoryModel");

const homeControlCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json({ success: true, categories });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// Search products by name
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ products: [] });

    const regex = new RegExp(q, "i"); // case-insensitive
    const products = await product
      .find({
        $or: [
          { name: { $regex: regex } },
          { category: { $regex: regex } },
        ],
      })
      .limit(10)
      .lean();

    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ products: [] });
  }
};



module.exports = {
  homeControl,
  categoryControl,
  searchProducts,
  detailControl,
  homeControlCategories,
  addProduct,
  editProduct,
  getCart,
  addToCart,
  deleteFromCart,
  checkoutCart,
};
