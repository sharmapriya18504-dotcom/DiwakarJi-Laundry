import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchPublicConfig } from '../services/api';
import { useTheme } from './ThemeContext';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const { setTheme } = useTheme();
  const [config, setConfig] = useState({
    settings: {
      active_theme: 'diwali',
      business_name: 'Diwakar Ji Laundry',
      owner_name: 'Diwakar Ji',
      whatsapp_number: '917860462268',
      contact_phone: '+91 7860462268',
      address: 'Kidwai Nagar & IIT Kanpur Area, Kanpur, Uttar Pradesh 208011',
      service_areas: 'Kakadeo, Swaroop Nagar, Kidwai Nagar, Kalyanpur, Civil Lines, Govind Nagar, Barra, IIT Kanpur Campus',
      hero_headline: 'Fresh Clothes.<br/><span class="gradient-text">Fresh Feel.</span>',
      hero_subtitle: 'Professional laundry & dry cleaning with free doorstep pickup & delivery across Kanpur. Cleaner clothes, happier homes.',
      festive_banner_enabled: 'true',
      festive_banner_text: '🪔 Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Doorstep Pickup & Delivery across Kanpur.',
      diwali_decorations_enabled: 'true'
    },
    services: [
      { id: 1, service_id: 'wash_fold', name: 'Wash & Fold', price: 40, unit: '/kg', image_url: '/wash_fold.png' },
      { id: 2, service_id: 'wash_iron', name: 'Wash & Iron', price: 60, unit: '/kg', image_url: '/wash_iron.png' },
      { id: 3, service_id: 'dry_cleaning', name: 'Dry Cleaning', price: 120, unit: '/piece', image_url: '/dry_cleaning.png' },
      { id: 4, service_id: 'steam_iron', name: 'Steam Ironing', price: 30, unit: '/piece', image_url: '/steam_iron.png' },
      { id: 5, service_id: 'blankets', name: 'Blankets & Bedsheets', price: 80, unit: '/piece', image_url: '/blankets.png' },
      { id: 6, service_id: 'express', name: 'Express Laundry', price: 70, unit: '/kg', image_url: '/express_laundry.png' }
    ],
    faqs: [],
    reviews: [],
    offers: []
  });
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      const data = await fetchPublicConfig();
      if (data && data.settings) {
        setConfig(data);
        if (data.settings.active_theme && !localStorage.getItem('diwakar_theme_preference')) {
          setTheme(data.settings.active_theme);
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
    <ConfigContext.Provider value={{ config, loading, refreshConfig: loadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
