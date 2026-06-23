import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function FloatingCartButton() {
  const { tableNumber, totalItems, totalAmount } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => navigate(`/table/${tableNumber}/cart`)}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl shadow-lg px-5 py-3.5 flex items-center justify-between max-w-md mx-auto animate-slide-up"
    >
      <span className="flex items-center gap-2 font-semibold">
        <ShoppingBag className="w-5 h-5" />
        {totalItems} item{totalItems > 1 ? 's' : ''}
      </span>
      <span className="font-semibold">View Cart · {formatCurrency(totalAmount, settings.currencySymbol)}</span>
    </button>
  );
}
