import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  cafeName: 'Smart Cafe',
  logo: '',
  phone: '',
  address: '',
  openingHours: '9:00 AM - 10:00 PM',
  currencySymbol: '₹',
  totalTables: 30,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const refreshSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (err) {
      // Fall back to defaults silently — settings are non-critical for
      // the customer ordering flow to function.
      console.warn('Could not load settings, using defaults.');
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loaded, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
