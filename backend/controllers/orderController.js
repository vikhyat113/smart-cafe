const Order = require('../models/Order');
const { buildOrderFromCart, isValidTransition } = require('../services/orderService');
const { emitOrderCreated, emitOrderStatusChanged } = require('../sockets');

// POST /api/orders (public — no login required)
async function createOrder(req, res) {
  const io = req.app.get('io');
  const { tableNumber, items } = req.body;

  const orderData = await buildOrderFromCart({
    tableNumber: Number(tableNumber),
    items,
  });

  // Duplicate-submit guard: if an identical order (same table + same
  // items + same total) was created in the last 10 seconds, treat this
  // as an accidental double-click rather than a second order. This is a
  // server-side backstop in addition to the frontend disabling the
  // "Place Order" button after the first click.
  const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
  const possibleDuplicate = await Order.findOne({
    tableNumber: orderData.tableNumber,
    totalAmount: orderData.totalAmount,
    createdAt: { $gte: tenSecondsAgo },
  }).sort({ createdAt: -1 });

  if (possibleDuplicate) {
    const sameItems =
      possibleDuplicate.items.length === orderData.items.length &&
      possibleDuplicate.items.every((existingItem, idx) => {
        const newItem = orderData.items[idx];
        return (
          String(existingItem.menuItemId) === String(newItem.menuItemId) &&
          existingItem.quantity === newItem.quantity
        );
      });

    if (sameItems) {
      return res.status(200).json(possibleDuplicate);
    }
  }

  const order = await Order.create(orderData);

  if (io) emitOrderCreated(io, order);

  res.status(201).json(order);
}

// GET /api/orders (admin) — supports filtering, search & pagination
async function getOrders(req, res) {
  const { status, tableNumber, orderId, date, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (tableNumber) filter.tableNumber = Number(tableNumber);
  if (orderId) filter.orderId = { $regex: orderId, $options: 'i' };

  if (date) {
    // date expected as YYYY-MM-DD, filters orders created that calendar day
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }

  if (search) {
    filter.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { 'items.name': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
}

// GET /api/orders/:orderId (public — customers use this to track their order)
async function getOrderByOrderId(req, res) {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
}

// PATCH /api/orders/:orderId/status (admin)
async function updateOrderStatus(req, res) {
  const io = req.app.get('io');
  const { status } = req.body;

  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!isValidTransition(order.status, status)) {
    return res.status(400).json({
      message: `Cannot move order from ${order.status} to ${status}`,
    });
  }

  order.status = status;
  await order.save();

  if (io) emitOrderStatusChanged(io, order);

  res.json(order);
}

module.exports = { createOrder, getOrders, getOrderByOrderId, updateOrderStatus };
