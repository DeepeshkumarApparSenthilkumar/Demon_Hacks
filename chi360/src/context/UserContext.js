import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenStore, fetchCsrfToken, authApi } from '../utils/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch CSRF token on boot (silently fails if no backend)
  useEffect(() => {
    fetchCsrfToken().catch(() => {});
  }, []);

  // Restore session from token
  useEffect(() => {
    const token = tokenStore.get();
    if (!token || token === 'demo-token') {
      // Restore demo session from sessionStorage
      const saved = sessionStorage.getItem('chi360_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch {}
      }
      setLoading(false);
      return;
    }
    authApi.me()
      .then(({ ok, data }) => {
        if (ok) setUser(data.user);
        else tokenStore.clear();
      })
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, token) => {
    if (token) tokenStore.set(token);
    sessionStorage.setItem('chi360_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const updateProfile = useCallback((name, area) => {
    setUser(prev => {
      const updated = { ...prev, name, area };
      sessionStorage.setItem('chi360_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    tokenStore.clear();
    sessionStorage.removeItem('chi360_user');
    setUser(null);
  }, []);

  const sessionExpired = useCallback(() => {
    tokenStore.clear();
    sessionStorage.removeItem('chi360_user');
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, login, updateProfile, logout, sessionExpired }}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}