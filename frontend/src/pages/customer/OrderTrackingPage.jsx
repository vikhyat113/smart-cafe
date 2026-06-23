import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClipboardList, Hash, Table2 } from 'lucide-react';
import api from '../../services/api.js';
import { useSocket } from '../../contexts/SocketContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatCurrency.js';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import OrderTimeline from '../../components/customer/OrderTimeline.jsx';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { socket } = useSocket();
  const { settings } = useSettings();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Join this order's socket room so we get pushed live status updates,
  // and leave it again on unmount to avoid stale room membership.
  useEffect(() => {
    if (!socket) return;
    socket.emit('join-order', orderId);

    const handleUpdate = (updatedOrder) => {
      if (updatedOrder.orderId === orderId) {
        setOrder(updatedOrder);
        toast.info(`Order status updated: ${updatedOrder.status}`);
      }
    };

    socket.on('order-updated', handleUpdate);

    return () => {
      socket.emit('leave-order', orderId);
      socket.off('order-updated', handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, orderId]);

  if (loading) {
    return <div className="max-w-xl mx-auto px-4 pt-10 text-center text-stone-400">Loading order...</div>;
  }

  if (notFound || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <ClipboardList className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <h2 className="font-semibold text-stone-700 dark:text-stone-200">Order not found</h2>
        <p className="text-sm text-stone-400 mt-1">Double-check the order link, or scan your table's QR code again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 pb-16 pt-6">
      <header className="mb-5 text-center">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">Tracking Order</p>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-1">{order.orderId}</h1>
        <div className="flex justify-center mt-2">
          <StatusBadge status={order.status} />
        </div>
      </header>

      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 mb-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <Table2 className="w-4 h-4" /> Table {order.tableNumber}
        </span>
        <span className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <Hash className="w-4 h-4" /> {formatDateTime(order.createdAt)}
        </span>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 mb-4">
        <h2 className="font-semibold text-sm text-stone-700 dark:text-stone-200 mb-3">Order Progress</h2>
        <OrderTimeline status={order.status} />
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 mb-4">
        <h2 className="font-semibold text-sm text-stone-700 dark:text-stone-200 mb-3">Items</h2>
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between text-sm">
              <div>
                <p className="text-stone-800 dark:text-stone-100">
                  {item.quantity} × {item.name}
                </p>
                {item.specialInstructions && (
                  <p className="text-xs text-stone-400 mt-0.5">Note: {item.specialInstructions}</p>
                )}
              </div>
              <span className="text-stone-600 dark:text-stone-300">
                {formatCurrency(item.priceAtOrderTime * item.quantity, settings.currencySymbol)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(order.totalAmount, settings.currencySymbol)}</span>
        </div>
      </div>

      <Link
        to={`/table/${order.tableNumber}`}
        className="block text-center text-brand-600 dark:text-brand-400 font-medium text-sm"
      >
        ← Back to menu
      </Link>
    </div>
  );
}
