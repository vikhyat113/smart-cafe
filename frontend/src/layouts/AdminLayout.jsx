import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar.jsx';
import ConnectionBanner from '../components/shared/ConnectionBanner.jsx';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-stone-50 dark:bg-stone-950">
      <ConnectionBanner />
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
