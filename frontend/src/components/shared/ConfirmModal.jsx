import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Generic confirmation modal used before destructive actions, e.g.
 * deleting a menu item or cancelling an order.
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4 animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-full ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-brand-100 dark:bg-brand-900/30'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-brand-600'}`} />
          </div>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">{title}</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-medium text-white transition ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
