import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api.js';

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(undefined);

const TOKEN_KEY = 'eventsphere_token';
const USER_KEY  = 'eventsphere_user';

/** Derives a URL-safe slug from an email address: alice@acme.com → alice */
export const emailToSlug = (email = '') =>
  email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-');

// ── Provider ───────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [token, setToken]       = useState(null);
  const [isLoading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persist = (authToken, authUser) => {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const authUser = {
      id:    data.userId,
      name:  data.name,
      email: data.email,
      role:  data.role,
    };
    persist(data.accessToken, authUser);
    return authUser;
  }, []);

  const register = useCallback(async (name, email, password, role = 'ROLE_ATTENDEE') => {
    const { data } = await authApi.register({ name, email, password, role });
    persist(data.accessToken, {
      id:    data.userId,
      name:  data.name,
      email: data.email,
      role:  data.role,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        emailToSlug,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
