const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderByOrderId,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(createOrder));
router.get('/', protect, asyncHandler(getOrders));
router.get('/:orderId', asyncHandler(getOrderByOrderId));
router.patch('/:orderId/status', protect, asyncHandler(updateOrderStatus));

module.exports = router;
