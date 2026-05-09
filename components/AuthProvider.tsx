'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  fullName: string | null;
  role: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status via session API
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (data?.authenticated) {
          setIsAuthenticated(true);
          setFullName(data.fullName || null);
          setRole(data.role || null);
        } else {
          setIsAuthenticated(false);
          setFullName(null);
          setRole(null);
        }
      } catch {
        setIsAuthenticated(false);
        setFullName(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setFullName(data.fullName || null);
        setRole(data.role || null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      console.error('Logout error');
    }
    setIsAuthenticated(false);
    setFullName(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, fullName, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
