const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const  verifyToken  = require("../middleware/authMiddleware"); // ✅ Import Middleware
const User = require("../models/User"); // ✅ Ensure correct User model import
require("dotenv").config();

const router = express.Router();

// ✅ User Registration Route
router.post("/register", async (req, res) => {
    try {
        let { name, email, password } = req.body;
        email = email.toLowerCase(); // Normalize email

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "❌ User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword });

        await user.save();
        res.status(201).json({ message: "✅ User registered successfully" });

    } catch (error) {
        console.error("❌ Registration Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ User Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "❌ Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "❌ Invalid email or password" });
        }

        // Construct the payload with 'id' instead of 'userId'
        const payload = {
            id: user._id,  // Changed from userId to id
            email: user.email, // You can include other user data if needed
            // ... other user data ...
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "✅ Login successful", token });

    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/profile", verifyToken, async (req, res) => {
    try {
        // Extract user ID from verified token
        const userId = req.user.id;
        console.log("🔹 Extracted userId:", userId);

        // Ensure userId is a valid MongoDB ObjectId
        if (!userId) {
            return res.status(400).json({ message: "❌ User ID missing from token" });
        }

        // Find user in database
        const user = await User.findById(userId).select("-password"); // Exclude password from response
        console.log("🔹 Found User:", user);

        if (!user) {
            return res.status(404).json({ message: "❌ No user found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Profile Fetch Error:", error);
        res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
    }
});
// ✅ Protected Profile Route (Requires Token)
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "❌ User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Profile Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Global Error Handler
router.use((err, req, res, next) => {
    console.error("🔥 Global Error:", err.stack);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

module.exports = router;
