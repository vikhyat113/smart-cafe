import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ShieldCheck } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext.jsx';

/**
 * Shown at "/" — i.e. if someone visits the site directly instead of
 * scanning a table QR code. In production this would rarely be hit by
 * customers, but it's a friendly landing spot instead of a blank page.
 */
export default function LandingPage() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-stone-50 dark:bg-stone-950">
      <QrCode className="w-14 h-14 text-brand-600 mb-4" />
      <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{settings.cafeName}</h1>
      <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-sm">
        Scan the QR code on your table to view the menu and place your order.
      </p>
      <Link
        to="/admin/login"
        className="mt-8 flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
      >
        <ShieldCheck className="w-4 h-4" /> Cafe staff login
      </Link>
    </div>
  );
}
