const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Order = require("../models/Order"); // Ensure correct path
const verifyToken = require("../middleware/authMiddleware"); // Ensure correct path

const router = express.Router();

router.post(
    "/create",
    verifyToken,
    [
        body("userId")
            .notEmpty().withMessage("User ID is required")
            .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid User ID"),
        body("products")
            .isArray({ min: 1 }).withMessage("Products must be an array with at least one item"),
        body("products.*.name").notEmpty().withMessage("Product name is required"),
        body("products.*.price").isNumeric().withMessage("Product price must be a number"),
        body("products.*.quantity").isInt({ min: 1 }).withMessage("Product quantity must be at least 1"),
        body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
        body("paymentMethod")
            .notEmpty().withMessage("Payment method is required")
            .isIn(["Credit Card", "PayPal", "Cash on Delivery"]).withMessage("Invalid payment method"),
    ],
    async (req, res) => {
        console.log("🔹 Incoming Request Body:", req.body); // Debug log

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let { userId, products, shippingAddress, paymentMethod } = req.body;

            // Convert userId to ObjectId
            userId = new mongoose.Types.ObjectId(userId);

            // Calculate total price automatically
            let totalPrice = 0;
            const updatedProducts = products.map(product => {
                const totalAmount = product.price * product.quantity;
                totalPrice += totalAmount;
                return { ...product, totalAmount };
            });

            console.log("🔹 Calculated Total Price:", totalPrice);

            const newOrder = new Order({
                userId,
                products: updatedProducts,
                totalPrice,
                shippingAddress,
                paymentMethod,
            });

            const savedOrder = await newOrder.save();
            console.log("✅ Order Created Successfully:", savedOrder);
            res.status(201).json(savedOrder);
        } catch (error) {
            console.error("❌ Error Creating Order:", error);
            res.status(500).json({ message: "Error creating order", error: error.message });
        }
    }
);


// Get All Orders (Admin Only)
router.get("/", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("userId", "name email") // 🔹 Ensure 'User' schema has 'name' & 'email'
            .sort({ createdAt: -1 }); // 🔹 Sort orders (newest first)

        res.status(200).json(orders);
    } catch (error) {
        console.error("🔹 Error Fetching Orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
});

// Get User Orders
router.get("/my-orders", verifyToken, async (req, res) => {
    try {
        console.log("🔹 Authenticated User ID:", req.user.id);  // Debugging
        const orders = await Order.find({ userId: req.user.id });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Fetch user orders error:", error);
        res.status(500).json({ message: "❌ Failed to fetch user orders", error: error.message });
    }
});

// Update Order Status (Admin Only)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "❌ Order not found" });
        }

        order.status = status;
        await order.save();
        res.status(200).json({ message: "✅ Order status updated", order });
    } catch (error) {
        res.status(500).json({ message: "❌ Failed to update order", error: error.message });
    }
});

// Delete an Order
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "❌ Order not found" });
        }

        res.status(200).json({ message: "✅ Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "❌ Failed to delete order", error: error.message });
    }
});

// Get User Orders
router.get("/my-orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Fetch user orders error:", error);
        res.status(500).json({ message: "❌ Failed to fetch user orders", error: error.message });
    }
});

// Update Order Status (Admin Only)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "❌ Order not found" });
        }

        order.status = status;
        await order.save();
        res.status(200).json({ message: "✅ Order status updated", order });
    } catch (error) {
        res.status(500).json({ message: "❌ Failed to update order", error: error.message });
    }
});

// Delete an Order
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "❌ Order not found" });
        }

        res.status(200).json({ message: "✅ Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "❌ Failed to delete order", error: error.message });
    }
});


module.exports = router;