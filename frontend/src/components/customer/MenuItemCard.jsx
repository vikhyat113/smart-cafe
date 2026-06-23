import React, { useState } from 'react';
import { Plus, Minus, ImageOff } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { API_URL } from '../../services/api.js';
import SpecialInstructionsModal from './SpecialInstructionsModal.jsx';

const ORIGIN = API_URL.replace(/\/api\/?$/, '');

export default function MenuItemCard({ item }) {
  const { cart, addItem, increaseQty, decreaseQty } = useCart();
  const { settings } = useSettings();
  const [showInstructions, setShowInstructions] = useState(false);

  const cartItem = cart.find((i) => i.menuItemId === item._id);

  const handleAddClick = () => {
    if (!item.available) return;
    setShowInstructions(true);
  };

  const confirmAdd = (instructions) => {
    addItem(item, 1, instructions);
    setShowInstructions(false);
  };

  return (
    <div
      className={`bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800 flex flex-col transition ${
        !item.available ? 'opacity-60' : 'hover:shadow-md'
      }`}
    >
      <div className="h-36 bg-stone-100 dark:bg-stone-800 relative">
        {item.image ? (
          <img src={`${ORIGIN}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <ImageOff className="w-8 h-8" />
          </div>
        )}
        {!item.available && (
          <span className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
            Currently Unavailable
          </span>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">{item.name}</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 flex-1">{item.description}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-brand-700 dark:text-brand-400">
            {formatCurrency(item.price, settings.currencySymbol)}
          </span>

          {!item.available ? (
            <span className="text-xs text-stone-400">Unavailable</span>
          ) : cartItem ? (
            <div className="flex items-center gap-1 bg-brand-600 rounded-lg">
              <button onClick={() => decreaseQty(item._id)} className="p-2.5 text-white active:bg-brand-700 rounded-lg">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white text-sm font-semibold w-4 text-center">{cartItem.quantity}</span>
              <button onClick={() => increaseQty(item._id)} className="p-2.5 text-white active:bg-brand-700 rounded-lg">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              className="bg-brand-600 hover:bg-brand-700 active:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg transition"
            >
              Add
            </button>
          )}
        </div>
      </div>

      <SpecialInstructionsModal
        open={showInstructions}
        item={item}
        onClose={() => setShowInstructions(false)}
        onConfirm={confirmAdd}
      />
    </div>
  );
}
