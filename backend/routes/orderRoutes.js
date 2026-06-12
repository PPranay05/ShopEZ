import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create new order & decrease stock
// @route   POST /api/orders
// @access  Private (Customer Only)
router.post('/', protect, async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentResult,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  try {
    // 1. Verify and update inventory stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stockQuantity < item.qty) {
          return res.status(400).json({
            message: `Sorry, insufficient stock remaining for: ${product.name}. Available: ${product.stockQuantity}`,
          });
        }
      } else {
        return res.status(404).json({ message: `Product reference ${item.product} not found` });
      }
    }

    // Decrement inventory stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      product.stockQuantity -= item.qty;
      await product.save();
    }

    // 2. Create the order
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true, // Assuming success from checkout simulation
      paidAt: Date.now(),
      paymentResult: {
        id: paymentResult?.id || `ch_mock_${Date.now()}`,
        status: paymentResult?.status || 'succeeded',
        update_time: new Date().toISOString(),
        email_address: req.user.email,
      },
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Check if user is the buyer or an admin
      if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders (Admin dashboard)
// @route   GET /api/orders
// @access  Private (Admin Only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private (Admin Only)
router.put('/:id/deliver', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
