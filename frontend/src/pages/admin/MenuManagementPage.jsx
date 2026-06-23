import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ImageOff, EyeOff, Eye } from 'lucide-react';
import api, { API_URL } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import MenuItemFormModal from '../../components/admin/MenuItemFormModal.jsx';
import ConfirmModal from '../../components/shared/ConfirmModal.jsx';
import { MenuItemSkeleton } from '../../components/shared/LoadingSkeleton.jsx';

const ORIGIN = API_URL.replace(/\/api\/?$/, '');
const CATEGORIES = ['Coffee', 'Tea', 'Pizza', 'Burger', 'Pasta', 'Desserts', 'Cold Drinks'];

export default function MenuManagementPage() {
  const toast = useToast();
  const { settings } = useSettings();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { admin: 'true' };
      if (category !== 'All') params.category = category;
      const { data } = await api.get('/menu', { params });
      setItems(data);
    } catch {
      toast.error('Could not load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const openCreate = () => { setEditingItem(null); setFormOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setFormOpen(true); };

  const handleSubmit = async (formData) => {
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Item updated');
      } else {
        await api.post('/menu', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Item created');
      }
      setFormOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save item');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const { data } = await api.patch(`/menu/${item._id}/availability`, { available: !item.available });
      setItems((prev) => prev.map((i) => (i._id === item._id ? data : i)));
      toast.success(data.available ? 'Item restored to menu' : 'Item hidden from customers');
    } catch {
      toast.error('Could not update availability');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/menu/${deleteTarget._id}`);
      toast.success('Item deleted');
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error('Could not delete item');
    }
  };

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">Menu Management</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Create, edit, hide, or remove menu items.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              category === c ? 'bg-brand-600 text-white' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <MenuItemSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-stone-400 mt-12">No menu items in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item._id} className={`bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
              <div className="h-28 bg-stone-100 dark:bg-stone-800 relative">
                {item.image ? (
                  <img src={`${ORIGIN}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageOff className="w-6 h-6" />
                  </div>
                )}
                {!item.available && (
                  <span className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                    Currently Unavailable
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-stone-800 dark:text-stone-100 truncate">{item.name}</h3>
                <p className="text-xs text-stone-400">{item.category}</p>
                <p className="font-medium text-brand-700 dark:text-brand-400 text-sm mt-1">
                  {formatCurrency(item.price, settings.currencySymbol)}
                </p>

                <div className="flex gap-1.5 mt-3">
                  <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => toggleAvailability(item)} className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800" title={item.available ? 'Hide' : 'Restore'}>
                    {item.available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuItemFormModal open={formOpen} item={editingItem} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />

      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        message="The item will be removed from the menu. Past orders that reference it are never affected."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
