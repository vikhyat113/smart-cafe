import React, { useState } from 'react';
import { X } from 'lucide-react';

const SUGGESTIONS = ['Less Sugar', 'Extra Cheese', 'No Onion', 'Extra Spicy', 'No Ice'];

export default function SpecialInstructionsModal({ open, item, onClose, onConfirm }) {
  const [text, setText] = useState('');

  if (!open || !item) return null;

  const toggleSuggestion = (s) => {
    setText((prev) => {
      const parts = prev.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.includes(s)) return parts.filter((p) => p !== s).join(', ');
      return [...parts, s].join(', ');
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 animate-slide-up">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">Special Instructions</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">for {item.name}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => {
            const active = text.split(',').map((p) => p.trim()).includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSuggestion(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                  active
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Less sugar, no onion..."
          rows={3}
          maxLength={200}
          className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(text)}
            className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
