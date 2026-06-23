import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { useSocket } from '../../contexts/SocketContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import OrderCard from '../../components/admin/OrderCard.jsx';
import { OrderCardSkeleton } from '../../components/shared/LoadingSkeleton.jsx';

const ACTIVE_STATUSES = ['NEW', 'ACCEPTED', 'PREPARING', 'READY'];

export default function OrdersPage() {
  const { socket } = useSocket();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders', { params: { limit: 100, sort: '-createdAt' } });
      setOrders(data.orders.filter((o) => ACTIVE_STATUSES.includes(o.status)));
    } catch {
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join the admin room and react instantly to new orders / status changes
  // coming from any other connected device, no polling needed.
  useEffect(() => {
    if (!socket) return;
    socket.emit('join-admin');

    const handleCreated = (order) => {
      setOrders((prev) => [order, ...prev]);
      toast.info(`New order ${order.orderId} from Table ${order.tableNumber}`);
    };

    const handleUpdated = (order) => {
      setOrders((prev) => {
        if (!ACTIVE_STATUSES.includes(order.status)) {
          return prev.filter((o) => o.orderId !== order.orderId);
        }
        return prev.map((o) => (o.orderId === order.orderId ? order : o));
      });
    };

    socket.on('order-created', handleCreated);
    socket.on('order-updated', handleUpdated);

    return () => {
      socket.off('order-created', handleCreated);
      socket.off('order-updated', handleUpdated);
    };
  }, [socket, toast]);

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, { status });
      if (!ACTIVE_STATUSES.includes(data.status)) {
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      } else {
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? data : o)));
      }
      toast.success(`${orderId} marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order');
    }
  };

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">Live Order Management</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">Incoming orders update here in real time.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-stone-400 text-center mt-16">No active orders right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.orderId} order={order} onUpdateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
