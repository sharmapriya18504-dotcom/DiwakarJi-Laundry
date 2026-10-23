import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchPublicConfig } from '../services/api';
import { useTheme } from './ThemeContext';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const { setTheme } = useTheme();
  const [config, setConfig] = useState({
    settings: {
      active_theme: 'classic',
      business_name: 'Diwakar Ji Laundry',
      owner_name: 'Diwakar Ji',
      whatsapp_number: '917860462268',
      contact_phone: '+91 7860462268',
      address: 'Kidwai Nagar & IIT Kanpur Area, Kanpur, Uttar Pradesh 208011',
      service_areas: 'Kakadeo, Swaroop Nagar, Kidwai Nagar, Kalyanpur, Civil Lines, Govind Nagar, Barra, IIT Kanpur Campus',
      hero_headline: 'Fresh Clothes.<br/><span class="gradient-text">Fresh Feel.</span>',
      hero_subtitle: 'Professional laundry & dry cleaning with free doorstep pickup & delivery across Kanpur. Cleaner clothes, happier homes.',
      festive_banner_enabled: 'false',
      festive_banner_text: '✨ Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Doorstep Pickup & Delivery across Kanpur.',
      diwali_decorations_enabled: 'false'
    },
    services: [
      { id: 1, service_id: 'wash_fold', name: 'Wash & Fold', price: 50, unit: '/kg', image_url: '/assets/laundry/wash-fold.webp' },
      { id: 2, service_id: 'wash_iron', name: 'Wash & Iron', price: 75, unit: '/kg', image_url: '/assets/laundry/wash-iron.webp' },
      { id: 3, service_id: 'dry_cleaning', name: 'Dry Cleaning', price: 150, unit: '/piece', image_url: '/assets/laundry/dry-cleaning.webp' },
      { id: 4, service_id: 'steam_iron', name: 'Steam Ironing', price: 25, unit: '/piece', image_url: '/assets/laundry/steam-iron.webp' },
      { id: 5, service_id: 'blankets', name: 'Blankets & Bedsheets', price: 250, unit: '/piece', image_url: '/assets/laundry/blankets.webp' },
      { id: 6, service_id: 'express', name: 'Express Laundry', price: 90, unit: '/kg', image_url: '/assets/laundry/express-laundry.webp' }
    ],
    faqs: [],
    reviews: [],
    offers: [],
    active_offer: null,
    theme_settings: {
      active_theme: 'classic',
      theme_mode: 'manual',
      fireworks_enabled: true
    }
  });
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      const data = await fetchPublicConfig();
      if (data && data.settings) {
        setConfig(data);
        const serverTheme = data.theme_settings?.active_theme || data.settings?.active_theme;
        const params = new URLSearchParams(window.location.search);
        const isPreview = params.get('theme_preview');
        if (serverTheme && !isPreview) {
          setTheme(serverTheme);
        }
      }
    } catch (e) {
      console.warn('Backend using default configuration:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{
      config,
      activeOffer: config.active_offer || null,
      themeSettings: config.theme_settings || null,
      loading,
      refreshConfig: loadConfig
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
