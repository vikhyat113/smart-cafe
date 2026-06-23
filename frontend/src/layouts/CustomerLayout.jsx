import React from 'react';
import { Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode.js';
import ConnectionBanner from '../components/shared/ConnectionBanner.jsx';

export default function CustomerLayout() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <ConnectionBanner />
      <button
        onClick={() => setIsDark((d) => !d)}
        className="fixed top-3 right-3 z-30 p-2.5 rounded-full bg-white dark:bg-stone-800 shadow border border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-300"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <Outlet />
    </div>
  );
}
