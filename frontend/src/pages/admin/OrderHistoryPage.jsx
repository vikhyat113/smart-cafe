import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '../../services/api.js';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatCurrency.js';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton.jsx';

const STATUSES = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];

export default function OrderHistoryPage() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({ status: '', date: '', tableNumber: '', search: '', sort: '-createdAt' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sort: filters.sort };
      if (filters.status) params.status = filters.status;
      if (filters.date) params.date = filters.date;
      if (filters.tableNumber) params.tableNumber = filters.tableNumber;
      if (filters.search) params.search = filters.search;

      const { data } = await api.get('/orders', { params });
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">Order History</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">{total} order{total !== 1 ? 's' : ''} found</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            placeholder="Search order ID or item..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => updateFilter('date', e.target.value)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm"
        />

        <input
          type="number"
          min="1"
          placeholder="Table #"
          value={filters.tableNumber}
          onChange={(e) => updateFilter('tableNumber', e.target.value)}
          className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm"
        />

        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm"
        >
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="-totalAmount">Highest total</option>
          <option value="totalAmount">Lowest total</option>
        </select>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-400 border-b border-stone-100 dark:border-stone-800">
              <th className="p-3 font-medium">Order ID</th>
              <th className="p-3 font-medium">Table</th>
              <th className="p-3 font-medium">Items</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Placed At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-stone-400">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.orderId} className="border-b border-stone-50 dark:border-stone-800/60 last:border-0">
                  <td className="p-3 font-medium text-stone-700 dark:text-stone-200">{o.orderId}</td>
                  <td className="p-3 text-stone-600 dark:text-stone-300">{o.tableNumber}</td>
                  <td className="p-3 text-stone-500 dark:text-stone-400 max-w-xs truncate">
                    {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </td>
                  <td className="p-3 text-stone-700 dark:text-stone-200">{formatCurrency(o.totalAmount, settings.currencySymbol)}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3 text-stone-400">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-stone-500">Page {page} of {pages}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
