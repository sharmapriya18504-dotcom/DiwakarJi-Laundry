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
          setAdmin(res.admin);
        } catch (e) {
          localStorage.removeItem('diwakar_admin_token');
          setToken(null);
          setAdmin(null);
        }
      }
      setChecking(false);
    }
    verify();
  }, [token]);

  const login = async (username, password) => {
    const res = await adminLogin(username, password);
    localStorage.setItem('diwakar_admin_token', res.token);
    setToken(res.token);
    setAdmin(res.admin);
    return res;
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
