import React from 'react';

export default function CategoryFilter({ categories, active, onChange }) {
  const all = ['All', ...categories];
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {all.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
            active === cat
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-brand-300'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
