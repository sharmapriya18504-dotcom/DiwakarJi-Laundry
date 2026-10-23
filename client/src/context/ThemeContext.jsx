import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, initialTheme = 'classic' }) {
  const [theme, setTheme] = useState(() => {
    // Check URL preview first
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('theme_preview');
    if (preview) return preview;
    return initialTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const switchTheme = (newTheme) => {
    setTheme(newTheme);
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
