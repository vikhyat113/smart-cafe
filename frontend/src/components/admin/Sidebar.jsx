import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, History, Settings, LogOut, Coffee, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDarkMode } from '../../hooks/useDarkMode.js';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Live Orders', icon: ClipboardList },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/history', label: 'Order History', icon: History },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useDarkMode();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-full sm:w-60 sm:min-h-screen bg-white dark:bg-stone-900 border-r border-stone-100 dark:border-stone-800 flex sm:flex-col">
      <div className="hidden sm:flex items-center gap-2 px-5 py-5 border-b border-stone-100 dark:border-stone-800">
        <Coffee className="w-5 h-5 text-brand-600" />
        <span className="font-bold text-stone-800 dark:text-stone-100">Smart Cafe Admin</span>
      </div>

      <nav className="flex sm:flex-col flex-1 overflow-x-auto sm:overflow-visible px-2 py-2 sm:py-4 gap-1">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition shrink-0 ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}

        {/* Logout & dark-mode are only hidden here on sm+ because the desktop
            footer below provides them there. On mobile, the footer is hidden,
            so these must stay visible in the scrollable nav row instead. */}
        <button
          onClick={() => setIsDark((d) => !d)}
          className="sm:hidden flex items-center justify-center px-3.5 py-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={handleLogout}
          className="sm:hidden flex items-center justify-center px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      <div className="hidden sm:block px-3 py-4 border-t border-stone-100 dark:border-stone-800 space-y-1">
        <p className="text-xs text-stone-400 px-3 mb-1 truncate">{admin?.email}</p>
        <button
          onClick={() => setIsDark((d) => !d)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
