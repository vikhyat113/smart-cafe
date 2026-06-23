import React from 'react';
import { Routes, Route } from 'react-router-dom';

import CustomerLayout from './layouts/CustomerLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import MenuPage from './pages/customer/MenuPage.jsx';
import CartPage from './pages/customer/CartPage.jsx';
import OrderTrackingPage from './pages/customer/OrderTrackingPage.jsx';

import LoginPage from './pages/admin/LoginPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import OrdersPage from './pages/admin/OrdersPage.jsx';
import MenuManagementPage from './pages/admin/MenuManagementPage.jsx';
import OrderHistoryPage from './pages/admin/OrderHistoryPage.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public landing page (direct visits, not via QR scan) */}
      <Route path="/" element={<LandingPage />} />

      {/* Customer flow — reached by scanning a table's QR code */}
      <Route element={<CustomerLayout />}>
        <Route path="/table/:tableNumber" element={<MenuPage />} />
        <Route path="/table/:tableNumber/cart" element={<CartPage />} />
        <Route path="/order/:orderId" element={<OrderTrackingPage />} />
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected admin dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="history" element={<OrderHistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
