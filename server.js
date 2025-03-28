const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const axios = require("axios");
const connectDB = require("./db"); 
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const mpesaRoutes = require("./routes/mpesaRoutes"); // ✅ Import M-Pesa routes

dotenv.config();
const app = express();

// ✅ Connect to MongoDB
connectDB().catch((err) => {
  console.error("❌ MongoDB Connection Error:", err.message);
  process.exit(1);
});

// ✅ Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ✅ Log every incoming request (🔍 Debugging Middleware)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Handle invalid JSON errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "❌ Invalid JSON payload" });
  }
  next(err);
});

// ✅ Debugging: Check if routes are imported properly
console.log("🔍 Debugging Routes:");
console.log("authRoutes:", authRoutes ? "✅ Loaded" : "❌ Not Loaded");
console.log("productRoutes:", productRoutes ? "✅ Loaded" : "❌ Not Loaded");
console.log("cartRoutes:", cartRoutes ? "✅ Loaded" : "❌ Not Loaded");
console.log("orderRoutes:", orderRoutes ? "✅ Loaded" : "❌ Not Loaded");
console.log("mpesaRoutes:", mpesaRoutes ? "✅ Loaded" : "❌ Not Loaded");

// ✅ M-Pesa Routes
app.use("/mpesa", mpesaRoutes); // ✅ Register M-Pesa routes

// ✅ Enhanced M-Pesa Callback Route with Validation and Logging
app.post("/mpesa/callback", (req, res) => {
  console.log("🔔 M-Pesa Callback Received:", req.body);

  // Validate callback body
  if (!req.body.Body || !req.body.Body.stkCallback) {
    return res.status(400).json({ message: "Invalid callback data" });
  }

  const { stkCallback } = req.body.Body;
  console.log("✅ M-Pesa STK Callback Details:", stkCallback);

  // ✅ You can store the response in the database or process it as needed
  res.status(200).json({ message: "M-Pesa Callback Processed Successfully" });
});

// ✅ Routes
if (authRoutes) app.use("/api/auth", authRoutes);
if (productRoutes) app.use("/api/products", productRoutes);
if (cartRoutes) app.use("/api/cart", cartRoutes);
if (orderRoutes) app.use("/api/orders", orderRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 API is running successfully!" });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`❌ Server Error: ${err.message}`);
  res.status(500).json({ message: "❌ Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// ✅ Handle process termination (CTRL+C or kill command)
process.on("SIGTERM", () => {
  console.log("🔴 SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});
