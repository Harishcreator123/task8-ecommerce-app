
const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

const router = express.Router();

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Place order
router.post("/", authenticate, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const quantities = new Map();

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.product) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({ message: "Invalid cart item" });
      }

      const id = item.product.toString();
      quantities.set(id, (quantities.get(id) || 0) + item.quantity);
    }

    const session = await mongoose.startSession();
    let createdOrder;

    try {
      await session.withTransaction(async () => {
        let totalAmount = 0;
        const orderItems = [];

        for (const [id, quantity] of quantities) {
          const product = await Product.findById(id).session(session);

          if (!product || product.stock < quantity) {
            throw new Error("Product unavailable or insufficient stock");
          }

          product.stock -= quantity;
          await product.save({ session });

          totalAmount += product.price * quantity;

          orderItems.push({
            product: product._id,
            quantity
          });
        }

        const orders = await Order.create([{
          user: req.user.userId,
          items: orderItems,
          totalAmount
        }], { session });

        createdOrder = orders[0];
      });
    } finally {
      await session.endSession();
    }

    res.status(201).json({
      message: "Order placed successfully",
      order: createdOrder
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Unable to place order" });
  }
});

// Get logged-in customer's orders
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch orders" });
  }
});

module.exports = router;
