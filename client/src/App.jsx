import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './styles/themes.css';
import './styles/main.css';
import './styles/admin.css';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ConfigProvider>
          <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Customer Website Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<HomePage />} />
              <Route path="/booking" element={<HomePage />} />

              {/* Admin Portal Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
    </ThemeProvider>
  </LanguageProvider>
  );
}
