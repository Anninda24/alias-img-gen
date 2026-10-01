'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession, getAuthSession, setAuthSession, clearAuthSession, loginWithDevCredentials } from './auth';

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, tenantId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage or auto-bootstrap dev session
  useEffect(() => {
    const existing = getAuthSession();
    if (existing) {
      setSessionState(existing);
      setIsLoading(false);
    } else {
      // Auto-bootstrap default developer session in local dev for seamless developer ergonomics
      loginWithDevCredentials('developer@example.com')
        .then((res) => {
          if (res.success && res.session) {
            setSessionState(res.session);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const login = useCallback(async (email: string = 'developer@example.com', tenantId?: string) => {
    setIsLoading(true);
    const result = await loginWithDevCredentials(email, tenantId);
    if (result.success && result.session) {
      setSessionState(result.session);
    }
    setIsLoading(false);
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setSessionState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session?.access_token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
