import React, { useEffect, useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { API_URL } from '../../services/api.js';

const ORIGIN = API_URL.replace(/\/api\/?$/, '');
const CATEGORIES = ['Coffee', 'Tea', 'Pizza', 'Burger', 'Pasta', 'Desserts', 'Cold Drinks'];

const EMPTY = { name: '', description: '', price: '', category: CATEGORIES[0], available: true };

export default function MenuItemFormModal({ open, item, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        available: item.available,
      });
      setPreview(item.image ? item.image : '');
    } else {
      setForm(EMPTY);
      setPreview('');
    }
    setImageFile(null);
  }, [item, open]);

  if (!open) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('category', form.category);
      fd.append('available', form.available);
      if (imageFile) fd.append('image', imageFile);
      await onSubmit(fd);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 max-h-[90vh] overflow-y-auto animate-slide-up"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">{item ? 'Edit Item' : 'Add Menu Item'}</h3>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="block mb-3">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Image</span>
          <label className="mt-1.5 flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 cursor-pointer overflow-hidden bg-stone-50 dark:bg-stone-800">
            {preview ? (
              <img
                src={preview.startsWith('blob:') ? preview : `${ORIGIN}${preview}`}
                alt="preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center text-stone-400 text-xs">
                <ImagePlus className="w-6 h-6 mb-1" /> Upload image
              </span>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </label>

        <label className="block mb-3">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>

        <label className="block mb-3">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Description</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Price</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 mb-5">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="w-4 h-4 rounded accent-orange-600"
          />
          <span className="text-sm text-stone-600 dark:text-stone-300">Available for ordering</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
        >
          {saving ? 'Saving...' : item ? 'Save Changes' : 'Add Item'}
        </button>
      </form>
    </div>
  );
}
