import { useEffect, useState } from 'react';

/**
 * Persists dark mode preference in localStorage and toggles the "dark"
 * class on <html>, which Tailwind's darkMode: 'class' strategy reads.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('smart_cafe_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('smart_cafe_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return [isDark, setIsDark];
}
