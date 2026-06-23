const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const generateOrderId = require('../utils/generateOrderId');

// Defines which status transitions are legal. This prevents, for example,
// jumping straight from NEW to SERVED, or "un-cancelling" an order.
const ALLOWED_TRANSITIONS = {
  NEW: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'CANCELLED'],
  SERVED: [],
  CANCELLED: [],
};

function isValidTransition(currentStatus, nextStatus) {
  if (!Order.STATUSES.includes(nextStatus)) return false;
  return (ALLOWED_TRANSITIONS[currentStatus] || []).includes(nextStatus);
}

/**
 * Builds a validated order from raw cart payload: looks up each menu item
 * server-side (never trusts client-sent prices), checks availability, and
 * snapshots the current price as priceAtOrderTime.
 */
async function buildOrderFromCart({ tableNumber, items }) {
  if (!tableNumber || !Number.isInteger(tableNumber) || tableNumber < 1) {
    const err = new Error('A valid table number is required');
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Cart cannot be empty');
    err.statusCode = 400;
    throw err;
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of items) {
    const menuItem = await MenuItem.findById(cartItem.menuItemId);

    if (!menuItem || menuItem.isDeleted) {
      const err = new Error(`Menu item not found: ${cartItem.menuItemId}`);
      err.statusCode = 400;
      throw err;
    }

    if (!menuItem.available) {
      const err = new Error(`"${menuItem.name}" is currently unavailable`);
      err.statusCode = 400;
      throw err;
    }

    const quantity = Math.max(1, parseInt(cartItem.quantity, 10) || 1);

    orderItems.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      priceAtOrderTime: menuItem.price,
      quantity,
      specialInstructions: (cartItem.specialInstructions || '').trim().slice(0, 200),
    });

    totalAmount += menuItem.price * quantity;
  }

  // Ensure orderId uniqueness (astronomically unlikely to collide, but
  // we still guard against it rather than trust randomness blindly).
  let orderId;
  let attempts = 0;
  do {
    orderId = generateOrderId();
    attempts += 1;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Order.findOne({ orderId });
    if (!exists) break;
  } while (attempts < 5);

  return {
    orderId,
    tableNumber,
    items: orderItems,
    totalAmount,
    status: 'NEW',
  };
}

module.exports = { isValidTransition, buildOrderFromCart, ALLOWED_TRANSITIONS };
