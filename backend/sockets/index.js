/**
 * Socket.IO event wiring.
 *
 * Rooms used:
 *  - "admin"          all connected admin dashboards join this room and
 *                      receive every order-created / order-updated event.
 *  - "order-<orderId>" a customer tracking a specific order joins this
 *                      room and only receives updates for that order.
 *
 * Events emitted (see EVENTS below):
 *  - order-created     new order placed (sent to "admin" room)
 *  - order-accepted
 *  - order-preparing
 *  - order-ready
 *  - order-served
 *  - order-cancelled
 *  - order-updated     generic event sent alongside every status-specific
 *                      event above, sent to both the "admin" room and the
 *                      relevant "order-<orderId>" room. The customer
 *                      tracking page only needs to listen for this one.
 */

const EVENTS = {
  ORDER_CREATED: 'order-created',
  ORDER_ACCEPTED: 'order-accepted',
  ORDER_PREPARING: 'order-preparing',
  ORDER_READY: 'order-ready',
  ORDER_SERVED: 'order-served',
  ORDER_CANCELLED: 'order-cancelled',
  ORDER_UPDATED: 'order-updated',
};

const STATUS_TO_EVENT = {
  ACCEPTED: EVENTS.ORDER_ACCEPTED,
  PREPARING: EVENTS.ORDER_PREPARING,
  READY: EVENTS.ORDER_READY,
  SERVED: EVENTS.ORDER_SERVED,
  CANCELLED: EVENTS.ORDER_CANCELLED,
};

function initSockets(io) {
  io.on('connection', (socket) => {
    socket.on('join-admin', () => {
      socket.join('admin');
    });

    socket.on('join-order', (orderId) => {
      if (orderId) socket.join(`order-${orderId}`);
    });

    socket.on('leave-order', (orderId) => {
      if (orderId) socket.leave(`order-${orderId}`);
    });

    socket.on('disconnect', () => {
      // no-op, socket.io cleans up room membership automatically
    });
  });
}

/** Emit when a brand new order is created. */
function emitOrderCreated(io, order) {
  io.to('admin').emit(EVENTS.ORDER_CREATED, order);
}

/** Emit when an existing order's status changes. */
function emitOrderStatusChanged(io, order) {
  const specificEvent = STATUS_TO_EVENT[order.status];
  if (specificEvent) {
    io.to('admin').emit(specificEvent, order);
    io.to(`order-${order.orderId}`).emit(specificEvent, order);
  }
  io.to('admin').emit(EVENTS.ORDER_UPDATED, order);
  io.to(`order-${order.orderId}`).emit(EVENTS.ORDER_UPDATED, order);
}

module.exports = { initSockets, emitOrderCreated, emitOrderStatusChanged, EVENTS };
