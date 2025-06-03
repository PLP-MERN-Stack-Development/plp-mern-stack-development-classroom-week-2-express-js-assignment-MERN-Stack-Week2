// server.js - Express.js RESTful API Server

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const logger = require('./middleware/logger');
const authenticate = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError, ValidationError } = require('./errors/errors');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(logger);
app.use(authenticate);

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// Get all products with filtering and pagination
app.get('/api/products', (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  let filteredProducts = [...products];

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower)
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const response = {
    success: true,
    data: paginatedProducts,
    page: parseInt(page),
    limit: parseInt(limit),
    total: filteredProducts.length
  };

  res.json(response);
});

// Get a specific product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    throw new NotFoundError(`Product with ID ${req.params.id} not found`);
  }
  res.json(product);
});

// Create a new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  if (!name || !description || !price || !category || typeof inStock !== 'boolean') {
    throw new ValidationError('Missing required fields');
  }

  const product = {
    id: uuidv4(),
    name,
    description,
    price: parseFloat(price),
    category,
    inStock
  };

  products.push(product);
  res.status(201).json(product);
});

// Update an existing product
app.put('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${req.params.id} not found`);
  }

  const { name, description, price, category, inStock } = req.body;

  if (!name || !description || !price || !category || typeof inStock !== 'boolean') {
    throw new ValidationError('Missing required fields');
  }

  products[productIndex] = {
    ...products[productIndex],
    name,
    description,
    price: parseFloat(price),
    category,
    inStock
  };

  res.json(products[productIndex]);
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${req.params.id} not found`);
  }

  products.splice(productIndex, 1);
  res.status(204).send();
});

// Get product statistics
app.get('/api/products/stats', (req, res) => {
  const stats = products.reduce((acc, product) => {
    acc.total++;
    acc.categories[product.category] = (acc.categories[product.category] || 0) + 1;
    acc.inStock += product.inStock ? 1 : 0;
    acc.totalValue += product.price;
    return acc;
  }, {
    total: 0,
    categories: {},
    inStock: 0,
    totalValue: 0
  });

  res.json(stats);
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;