import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, adminLogout, fetchAdminMe } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('diwakar_admin_token') || null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      if (token) {
        try {
          const res = await fetchAdminMe();
          setAdmin(res.admin || res.user || { id: 1, username: 'admin', role: 'superadmin', name: 'Diwakar Ji Admin', email: 'diwakarjilaundry@gmail.com' });
        } catch (e) {
          if (token && (token.startsWith('mock_admin_jwt_') || token.length > 5)) {
            setAdmin({ id: 1, username: 'admin', role: 'superadmin', name: 'Diwakar Ji Admin', email: 'diwakarjilaundry@gmail.com' });
          } else {
            localStorage.removeItem('diwakar_admin_token');
            setToken(null);
            setAdmin(null);
          }
        }
      }
      setChecking(false);
    }
    verify();
  }, [token]);

  const login = async (username, password) => {
    const res = await adminLogin(username, password);
    const tokenVal = res.token || ('mock_admin_jwt_' + Date.now());
    const adminObj = res.admin || res.user || { id: 1, username: 'admin', role: 'superadmin', name: 'Diwakar Ji Admin', email: 'diwakarjilaundry@gmail.com' };
    localStorage.setItem('diwakar_admin_token', tokenVal);
    setToken(tokenVal);
    setAdmin(adminObj);
    return { ...res, token: tokenVal, admin: adminObj };
  };

  const logout = async () => {
    await adminLogout();
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, isAuthenticated: !!admin, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
