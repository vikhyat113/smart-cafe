import React, { useState } from 'react';
import { Table2, Clock } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge.jsx';
import ConfirmModal from '../shared/ConfirmModal.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { formatCurrency, formatTime } from '../../utils/formatCurrency.js';

// Defines the single "next step" action button shown per status, plus
// whether Cancel should also be offered alongside it.
const NEXT_ACTION = {
  NEW: { label: 'Accept', next: 'ACCEPTED' },
  ACCEPTED: { label: 'Start Preparing', next: 'PREPARING' },
  PREPARING: { label: 'Mark Ready', next: 'READY' },
  READY: { label: 'Mark Served', next: 'SERVED' },
};

export default function OrderCard({ order, onUpdateStatus }) {
  const { settings } = useSettings();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const action = NEXT_ACTION[order.status];
  const canCancel = order.status !== 'SERVED' && order.status !== 'CANCELLED';

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-stone-800 dark:text-stone-100">{order.orderId}</p>
          <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1"><Table2 className="w-3.5 h-3.5" /> Table {order.tableNumber}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTime(order.createdAt)}</span>
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="text-sm text-stone-600 dark:text-stone-300 divide-y divide-stone-100 dark:divide-stone-800">
        {order.items.map((item, idx) => (
          <div key={idx} className="py-1.5 flex justify-between">
            <span>{item.quantity} × {item.name}{item.specialInstructions ? ` (${item.specialInstructions})` : ''}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
        <span className="text-sm text-stone-500">Total</span>
        <span className="font-bold text-stone-800 dark:text-stone-100">
          {formatCurrency(order.totalAmount, settings.currencySymbol)}
        </span>
      </div>

      {(action || canCancel) && (
        <div className="flex gap-2 mt-3">
          {action && (
            <button
              onClick={() => onUpdateStatus(order.orderId, action.next)}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
            >
              {action.label}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <ConfirmModal
        open={confirmCancel}
        title={`Cancel ${order.orderId}?`}
        message="The customer will be notified that this order was cancelled."
        confirmLabel="Cancel Order"
        onConfirm={() => { onUpdateStatus(order.orderId, 'CANCELLED'); setConfirmCancel(false); }}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
