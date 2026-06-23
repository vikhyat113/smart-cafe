import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

function storageKey(tableNumber) {
  return `smart_cafe_cart_table_${tableNumber}`;
}

export function CartProvider({ children }) {
  const [tableNumber, setTableNumberState] = useState(null);
  const [cart, setCart] = useState([]);

  // Switching tables (e.g. scanning a different table's QR on the same
  // phone) loads that table's own persisted cart instead of mixing them.
  const setTableNumber = (num) => {
    setTableNumberState(num);
    try {
      const stored = localStorage.getItem(storageKey(num));
      setCart(stored ? JSON.parse(stored) : []);
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    if (tableNumber == null) return;
    localStorage.setItem(storageKey(tableNumber), JSON.stringify(cart));
  }, [cart, tableNumber]);

  const addItem = (menuItem, quantity = 1, specialInstructions = '') => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItem._id
            ? { ...i, quantity: i.quantity + quantity, specialInstructions: specialInstructions || i.specialInstructions }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          quantity,
          specialInstructions,
        },
      ];
    });
  };

  const increaseQty = (menuItemId) => {
    setCart((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i)));
  };

  const decreaseQty = (menuItemId) => {
    setCart((prev) =>
      prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (menuItemId) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateInstructions = (menuItemId, text) => {
    setCart((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, specialInstructions: text } : i)));
  };

  const clearCart = () => setCart([]);

  const totalAmount = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{
        tableNumber,
        setTableNumber,
        cart,
        addItem,
        increaseQty,
        decreaseQty,
        removeItem,
        updateInstructions,
        clearCart,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
