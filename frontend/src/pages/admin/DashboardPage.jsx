import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Activity, CheckCircle2, XCircle, IndianRupee } from 'lucide-react';
import api from '../../services/api.js';
import { useSocket } from '../../contexts/SocketContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { formatCurrency, formatTime } from '../../utils/formatCurrency.js';
import StatusBadge from '../../components/shared/StatusBadge.jsx';

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <p className="text-xl font-bold text-stone-800 dark:text-stone-100">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { socket } = useSocket();
  const { settings } = useSettings();
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchToday = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await api.get('/orders', { params: { date: today, limit: 100, sort: '-createdAt' } });
    setTodaysOrders(data.orders);
    setLoading(false);
  };

  useEffect(() => {
    fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-refresh the dashboard the moment any order changes anywhere.
  useEffect(() => {
    if (!socket) return;
    socket.emit('join-admin');
    socket.on('order-created', fetchToday);
    socket.on('order-updated', fetchToday);
    return () => {
      socket.off('order-created', fetchToday);
      socket.off('order-updated', fetchToday);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const active = todaysOrders.filter((o) => ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
  const completed = todaysOrders.filter((o) => o.status === 'SERVED');
  const cancelled = todaysOrders.filter((o) => o.status === 'CANCELLED');
  const revenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);
  const recent = todaysOrders.slice(0, 6);

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">Dashboard</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">Today's overview at a glance.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard icon={ClipboardList} label="Today's Orders" value={loading ? '—' : todaysOrders.length} accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30" />
        <StatCard icon={Activity} label="Active" value={loading ? '—' : active.length} accent="bg-amber-100 text-amber-600 dark:bg-amber-900/30" />
        <StatCard icon={CheckCircle2} label="Completed" value={loading ? '—' : completed.length} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" />
        <StatCard icon={XCircle} label="Cancelled" value={loading ? '—' : cancelled.length} accent="bg-red-100 text-red-600 dark:bg-red-900/30" />
        <StatCard icon={IndianRupee} label="Revenue (est.)" value={loading ? '—' : formatCurrency(revenue, settings.currencySymbol)} accent="bg-brand-100 text-brand-600 dark:bg-brand-900/30" />
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-stone-700 dark:text-stone-200">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-brand-600 font-medium">View all</Link>
        </div>

        {loading ? (
          <p className="text-stone-400 text-sm">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-stone-400 text-sm">No orders placed today yet.</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {recent.map((o) => (
              <div key={o.orderId} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-stone-800 dark:text-stone-100">{o.orderId} · Table {o.tableNumber}</p>
                  <p className="text-xs text-stone-400">{formatTime(o.createdAt)} · {formatCurrency(o.totalAmount, settings.currencySymbol)}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
