const express = require("express");
const mongoose = require("mongoose"); // ✅ Import Mongoose
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Your cart routes go here...


// ✅ Add to Cart Route
router.post("/add", verifyToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.userId;

        // 🛑 Validate Input
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "❌ Invalid product ID" });
        }
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "❌ Quantity must be at least 1" });
        }

        // 🔍 Validate Product Exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "❌ Product not found" });
        }

        // 🔹 Find or Create Cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // 🔹 Ensure items array exists
        if (!cart.items) {
            cart.items = [];
        }

        // 🛒 Add or Update Item in Cart
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        res.status(200).json({ message: "✅ Item added to cart", cart });

    } catch (error) {
        console.error("❌ Add to Cart Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Get Cart Route
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        let cart = await Cart.findOne({ user: userId }).populate("items.product");

        // 🔹 If cart doesn't exist, return an empty cart
        if (!cart) {
            return res.status(200).json({ message: "🛒 Cart is empty", cart: { items: [] } });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error("❌ Get Cart Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Remove Item from Cart
router.delete("/remove/:productId", verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        let cart = await Cart.findOne({ user: userId });

        if (!cart || !cart.items) {
            return res.status(404).json({ message: "❌ Cart is empty" });
        }

        // 🔹 Remove item from cart
        cart.items = cart.items.filter((item) => item.product.toString() !== productId);

        await cart.save();
        res.status(200).json({ message: "✅ Item removed", cart });
    } catch (error) {
        console.error("❌ Remove from Cart Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Clear Cart Route
router.delete("/clear", verifyToken, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.userId });
        res.status(200).json({ message: "🛒 Cart cleared successfully" });
    } catch (error) {
        console.error("❌ Clear Cart Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
