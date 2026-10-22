import React from 'react';
import { useConfig } from '../context/ConfigContext';
import { useTheme } from '../context/ThemeContext';

export default function WhatsAppFloat() {
  const { config } = useConfig();
  const { theme } = useTheme();

  const phone = config?.settings?.whatsapp_number || '917860462268';
  const showCompanion = theme === 'diwali';

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-float"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp with Diwakar Ji"
    >
      {showCompanion && (
        <span className="whatsapp-diya-companion" title="Shubh Diwali!">🪔</span>
      )}
      <i className="fa-brands fa-whatsapp" style={{ fontSize: '26px' }}></i>
      <span>Chat on WhatsApp</span>
    </a>
  );
}
