import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Simulate Stripe payment intent creation
// @route   POST /api/payments/intent
// @access  Private
router.post('/intent', protect, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount specified' });
  }

  // Simulate latency and return successful payment intent details
  setTimeout(() => {
    res.status(200).json({
      success: true,
      clientSecret: `pi_mock_secret_${Math.random().toString(36).substring(2, 15)}`,
      paymentId: `ch_mock_stripe_${Math.random().toString(36).substring(2, 15)}`,
      status: 'succeeded',
      message: 'Simulated payment succeeded. Transaction verified.'
    });
  }, 1000);
});

export default router;
