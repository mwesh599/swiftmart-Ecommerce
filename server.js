const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
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

// ✅ CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Allow the frontend (localhost:3000) to make requests
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 200, // For legacy browsers
};
app.use(cors(corsOptions)); // Apply CORS middleware

// ✅ Middleware
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Request logging
app.use(express.json()); // Parse incoming JSON requests

// ✅ Debugging middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`📥 Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});


// ✅ Handle invalid JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "❌ Invalid JSON payload" });
  }
  next(err);
});

// ✅ Debugging logs for routes
console.log("🔍 Debugging Routes:");
console.log("authRoutes:", authRoutes ? "✅ Loaded" : "❌ Not Loaded");
console.log("productRoutes:", productRoutes ? "✅ Loaded" : "❌ Not Loaded");
console.log("cartRoutes:", cartRoutes ? "✅ Loaded" : "❌ Not Loaded");
console.log("orderRoutes:", orderRoutes ? "✅ Loaded" : "❌ Not Loaded");
console.log("mpesaRoutes:", mpesaRoutes ? "✅ Loaded" : "❌ Not Loaded");

// ✅ Register routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/mpesa", mpesaRoutes); // M-Pesa routes

// ✅ Preflight request handler for all routes
app.options("*", cors(corsOptions));

// ✅ M-Pesa Callback Route
app.post("/mpesa/callback", (req, res) => {
  console.log("🔔 M-Pesa Callback Received:", req.body);

  // Validate callback payload
  if (!req.body.Body || !req.body.Body.stkCallback) {
    return res.status(400).json({ message: "❌ Invalid callback data" });
  }

  const { stkCallback } = req.body.Body;
  console.log("✅ M-Pesa STK Callback Details:", stkCallback);

  // Process and store callback data here (e.g., save to database)
  res.status(200).json({ message: "✅ Callback processed successfully" });
});

// ✅ Default route
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 API is running successfully!" });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(`❌ Server Error: ${err.message}`);
  res.status(500).json({ message: "❌ Internal Server Error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// ✅ Handle process termination (e.g., CTRL+C)
process.on("SIGTERM", () => {
  console.log("🔴 SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});
