import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api.js';
import { useCart } from '../../contexts/CartContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import SearchBar from '../../components/customer/SearchBar.jsx';
import CategoryFilter from '../../components/customer/CategoryFilter.jsx';
import MenuItemCard from '../../components/customer/MenuItemCard.jsx';
import FloatingCartButton from '../../components/customer/FloatingCartButton.jsx';
import { MenuItemSkeleton } from '../../components/shared/LoadingSkeleton.jsx';

const CATEGORIES = ['Coffee', 'Tea', 'Pizza', 'Burger', 'Pasta', 'Desserts', 'Cold Drinks'];

export default function MenuPage() {
  const { tableNumber } = useParams();
  const { setTableNumber } = useCart();
  const { settings } = useSettings();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Register this table with the cart context as soon as the customer
  // lands on the menu page via their table's QR code.
  useEffect(() => {
    setTableNumber(Number(tableNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableNumber]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'All') params.category = category;
    if (search) params.search = search;

    api
      .get('/menu', { params })
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-28 pt-4">
      <header className="mb-4 pr-12">
        <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">{settings.cafeName}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">Table {tableNumber} · Browse &amp; order</p>
      </header>

      <div className="space-y-3 mb-4">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter categories={CATEGORIES} active={category} onChange={setCategory} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <MenuItemSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-stone-500 dark:text-stone-400 mt-12">No menu items found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => <MenuItemCard key={item._id} item={item} />)}
        </div>
      )}

      <FloatingCartButton />
    </div>
  );
}
