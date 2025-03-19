const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const router = express.Router();

// ✅ Get all products
router.get('/', async (req, res) => {
    try {
        console.log('🟡 Fetching all products');
        const products = await Product.find();
        
        if (!products.length) {
            console.log('⚠️ No products found');
            return res.status(404).json({ message: 'No products found' });
        }

        console.log(`✅ Found ${products.length} products`);
        res.status(200).json(products);
    } catch (error) {
        console.error(`❌ Error fetching products: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ✅ Get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🟡 Fetching product with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log(`✅ Product found:`, product);
        res.status(200).json(product);
    } catch (error) {
        console.error(`❌ Error fetching product: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ✅ Create a new product
router.post('/', async (req, res) => {
    try {
        console.log('🟡 Creating a new product');

        const { name, description, price, category, stock, image } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            stock: stock || 0,
            image: image || 'https://via.placeholder.com/150'
        });

        await product.save();
        console.log(`✅ Product created: ${product._id}`);
        res.status(201).json(product);
    } catch (error) {
        console.error(`❌ Error creating product: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ✅ Update a product by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🟡 Updating product with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log(`✅ Product updated: ${updatedProduct._id}`);
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(`❌ Error updating product: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ✅ Delete a product by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🟡 Deleting product with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log(`✅ Product deleted: ${id}`);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(`❌ Error deleting product: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
