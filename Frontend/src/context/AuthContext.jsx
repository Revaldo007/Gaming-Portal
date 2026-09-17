import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "../api";

const TOKEN_KEY = "gp_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (tok) => {
    if (!tok) {
      setUser(null);
      return null;
    }
    try {
      const me = await api.getMe(tok);
      setUser(me);
      return me;
    } catch {
      // Token is invalid or expired — drop it.
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshUser(token);
      setLoading(false);
    })();
    // Only run once on mount — refreshUser is called explicitly elsewhere after login/register.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(username, password) {
    const { access_token } = await api.login({ username, password });
    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
    await refreshUser(access_token);
  }

  async function register(username, password, displayName) {
    await api.register({ username, password, display_name: displayName });
    await login(username, password);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = { token, user, setUser, loading, login, register, logout, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
