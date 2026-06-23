import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import api from '../../services/api.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import ConfirmModal from '../../components/shared/ConfirmModal.jsx';

export default function CartPage() {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { settings } = useSettings();
  const { cart, increaseQty, decreaseQty, removeItem, updateInstructions, clearCart, totalAmount } = useCart();

  const [placing, setPlacing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handlePlaceOrder = async () => {
    if (placing || cart.length === 0) return; // guards against double-submit
    setPlacing(true);
    try {
      const { data: order } = await api.post('/orders', {
        tableNumber: Number(tableNumber),
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
        })),
      });
      clearCart();
      toast.success('Order placed! Tracking your order...');
      navigate(`/order/${order.orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-32 pt-4">
      <header className="flex items-center gap-3 mb-4">
        <Link to={`/table/${tableNumber}`} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">Your Cart</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">Table {tableNumber}</p>
        </div>
      </header>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-20 text-stone-400">
          <ShoppingBag className="w-12 h-12 mb-3" />
          <p className="font-medium">Your cart is empty</p>
          <Link to={`/table/${tableNumber}`} className="text-brand-600 font-medium mt-2">
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.menuItemId} className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-3.5">
                <div className="flex justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-stone-800 dark:text-stone-100">{item.name}</h3>
                    <p className="text-brand-700 dark:text-brand-400 text-sm font-medium mt-0.5">
                      {formatCurrency(item.price, settings.currencySymbol)}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.menuItemId)} className="text-stone-400 hover:text-red-500 active:text-red-600 p-2 -m-2 h-fit">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  value={item.specialInstructions}
                  onChange={(e) => updateInstructions(item.menuItemId, e.target.value)}
                  placeholder="Add special instructions..."
                  maxLength={200}
                  className="w-full mt-2 text-xs px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
                    <button onClick={() => decreaseQty(item.menuItemId)} className="p-3 text-stone-600 dark:text-stone-300 active:bg-stone-200 dark:active:bg-stone-700 rounded-lg">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => increaseQty(item.menuItemId)} className="p-3 text-stone-600 dark:text-stone-300 active:bg-stone-200 dark:active:bg-stone-700 rounded-lg">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-semibold text-sm text-stone-700 dark:text-stone-200">
                    {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs text-stone-400 hover:text-red-500 mt-3 underline"
          >
            Clear cart
          </button>

          <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-stone-500 dark:text-stone-400">Total</span>
                <span className="font-bold text-lg text-stone-800 dark:text-stone-100">
                  {formatCurrency(totalAmount, settings.currencySymbol)}
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition"
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmClear}
        title="Clear your cart?"
        message="All items will be removed from your cart."
        confirmLabel="Clear Cart"
        onConfirm={() => { clearCart(); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
