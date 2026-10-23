import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, initialTheme = 'diwali' }) {
  const [theme, setTheme] = useState(() => {
    // 1. Check URL preview first
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('theme_preview');
    if (preview) return preview;

    // 2. Check admin theme configuration saved from admin appearance section
    try {
      const adminTheme = JSON.parse(localStorage.getItem('diwakar_admin_theme') || 'null');
      if (adminTheme?.active_theme) return adminTheme.active_theme;
      if (adminTheme?.configured_theme) return adminTheme.configured_theme;
    } catch (e) {}

    // 3. Check direct saved theme
    const saved = localStorage.getItem('diwakar_theme');
    if (saved) return saved;

    return initialTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('diwakar_theme', theme);
  }, [theme]);

  // Listen to cross-tab storage updates and in-tab custom events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'diwakar_admin_theme' || e.key === 'diwakar_theme') {
        try {
          const adminTheme = JSON.parse(localStorage.getItem('diwakar_admin_theme') || 'null');
          const next = adminTheme?.active_theme || adminTheme?.configured_theme || localStorage.getItem('diwakar_theme');
          if (next && next !== theme) {
            setTheme(next);
          }
        } catch (err) {}
      }
    };

    const handleCustomEvent = (e) => {
      if (e.detail?.theme && e.detail.theme !== theme) {
        setTheme(e.detail.theme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('diwakar_theme_changed', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('diwakar_theme_changed', handleCustomEvent);
    };
  }, [theme]);

  const switchTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('diwakar_theme', newTheme);
    try {
      const adminTheme = JSON.parse(localStorage.getItem('diwakar_admin_theme') || '{}');
      adminTheme.active_theme = newTheme;
      adminTheme.configured_theme = newTheme;
      localStorage.setItem('diwakar_admin_theme', JSON.stringify(adminTheme));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('diwakar_theme_changed', { detail: { theme: newTheme } }));
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
