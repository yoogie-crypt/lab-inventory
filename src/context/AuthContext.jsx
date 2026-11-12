import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.currentUser());

  useEffect(() => {
    // Sesi kedaluwarsa / akun dinonaktifkan -> kembali ke login
    const onExpired = () => setUser(null);
    window.addEventListener(api.SESSION_EXPIRED_EVENT, onExpired);

    // Saat aplikasi dibuka, pastikan sesi tersimpan masih berlaku di server
    if (api.currentUser()) {
      api.verifySession().then(setUser).catch(() => { /* ditangani oleh event di atas */ });
    }
    return () => window.removeEventListener(api.SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (username, password) => {
    const u = await api.login(username, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, setUser, isAdmin: user?.role === 'admin' }),
    [user, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
