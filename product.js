
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ProductData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a product schema
const productSchema = new mongoose.Schema({
  product_name: String,
  price: Number,
});

// Create a product model
const Product = mongoose.model('product_details', productSchema);

// Authorization middleware
const authorize = (req, res, next) => {
  // Check for authorization token
  const token = req.headers.authorization;

  // Verify the token (e.g., decode and validate)
  // Replace this with your own token verification logic

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Proceed to the next middleware if authorized
  next();
};

// POST /productsave endpoint with authorization middleware
app.post('/productsave', authorize, async (req, res) => {
  const { product_name, price } = req.body;

  // Checking if both product_name and price are provided in the request
  if (!product_name || !price) {
    return res.status(400).json({ error: 'Missing product_name or price' });
  }

  // Creating a new product object
  const newProduct = new Product({
    product_name,
    price,
  });

  try {
    // Save the new product to the database
    await newProduct.save();
    console.log('Data saved successfully');
    return res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save product' });
  }
});

// GET /products endpoint
app.get('/products', async (req, res) => {
  const searchQuery = req.query.q; // Get the search term from query parameters

  try {
    let products;

    if (searchQuery) {
      // If search term exists, perform a search query
      products = await Product.find({ product_name: { $regex: searchQuery, $options: 'i' } }).lean();
    } else {
      // If no search term, retrieve all products
      products = await Product.find().lean();
    }

    return res.status(200).json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
