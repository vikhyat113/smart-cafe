import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';

export default function SettingsPage() {
  const toast = useToast();
  const { settings, refreshSettings } = useSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', form);
      await refreshSettings();
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'cafeName', label: 'Cafe Name', type: 'text' },
    { key: 'logo', label: 'Logo URL', type: 'text', placeholder: 'https://...' },
    { key: 'phone', label: 'Phone Number', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'openingHours', label: 'Opening Hours', type: 'text', placeholder: '9:00 AM - 10:00 PM' },
    { key: 'currencySymbol', label: 'Currency Symbol', type: 'text', placeholder: '₹' },
    { key: 'totalTables', label: 'Total Tables', type: 'number' },
  ];

  return (
    <div className="max-w-xl">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">Settings</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">Update your cafe's public information.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 space-y-4">
        {fields.map(({ key, label, type, placeholder }) => (
          <label key={key} className="block">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</span>
            <input
              type={type}
              value={form?.[key] ?? ''}
              placeholder={placeholder}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
