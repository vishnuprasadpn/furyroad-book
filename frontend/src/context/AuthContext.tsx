import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'main_admin' | 'secondary_admin' | 'staff';
  is_active: boolean;
  permissions?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, code?: string, password?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Keep-alive ping to prevent Fly.io app from sleeping
    // Ping every 4 minutes (240 seconds) to keep app awake
    const keepAliveInterval = setInterval(() => {
      // Only ping if user is logged in (to avoid unnecessary requests)
      if (localStorage.getItem('token')) {
        api.get('/health')
          .catch(() => {
            // Silent fail - don't show errors for keep-alive pings
          });
      }
    }, 4 * 60 * 1000); // 4 minutes

    // Cleanup interval on unmount
    return () => clearInterval(keepAliveInterval);
  }, []);

  const login = async (email: string, code?: string, password?: string) => {
    const payload: { email: string; code?: string; password?: string } = { email };
    if (code) {
      payload.code = code;
    } else if (password) {
      payload.password = password;
    }
    const response = await api.post('/auth/login', payload);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

