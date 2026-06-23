import React from 'react';
import { Check, Clock, X } from 'lucide-react';

const STEPS = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'];

const STEP_LABELS = {
  NEW: 'Order Placed',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
};

export default function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4">
        <div className="bg-red-500 text-white rounded-full p-1.5">
          <X className="w-4 h-4" />
        </div>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-300 text-sm">Order Cancelled</p>
          <p className="text-xs text-red-500 dark:text-red-400">This order will not be prepared.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-1.5 ${
                  done || active
                    ? 'bg-brand-600 text-white'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] ${done ? 'bg-brand-600' : 'bg-stone-200 dark:bg-stone-700'}`} />
              )}
            </div>
            <div className={`pb-7 ${active ? 'animate-pulse' : ''}`}>
              <p
                className={`text-sm font-semibold ${
                  done || active ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                {STEP_LABELS[step]}
              </p>
              {active && <p className="text-xs text-brand-600 dark:text-brand-400">In progress...</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
