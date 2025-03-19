const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Ensure this matches the User model name
            required: [true, "User ID is required"],
        },
        products: [
            {
                name: { type: String, required: [true, "Product name is required"] },
                price: { 
                    type: Number, 
                    required: [true, "Product price is required"], 
                    min: [0, "Product price cannot be negative"] 
                },
                quantity: { 
                    type: Number, 
                    required: [true, "Product quantity is required"], 
                    min: [1, "Quantity must be at least 1"] 
                },
                totalAmount: { 
                    type: Number, 
                    required: true 
                },
            }
        ],
        totalPrice: {
            type: Number,
            required: true,
            min: [0, "Total price cannot be negative"],
        },
        shippingAddress: {
            type: String,
            required: [true, "Shipping address is required"],
        },
        paymentMethod: {
            type: String,
            enum: ["Credit Card", "PayPal", "Cash on Delivery"],
            required: [true, "Payment method is required"],
        },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

// 🛠 Fix: Auto-calculate totalAmount for each product before saving
OrderSchema.pre("save", function (next) {
    this.products.forEach(product => {
        product.totalAmount = product.price * product.quantity;
    });

    // 🔹 Ensure totalPrice is updated correctly
    this.totalPrice = this.products.reduce((sum, product) => sum + product.totalAmount, 0);

    next();
});

module.exports = mongoose.model("Order", OrderSchema);
