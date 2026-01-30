import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.accessToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Auth check failed:', err);
          apiClient.clearTokens();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await authApi.login(email, password);
      apiClient.setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      setOrganization(result.user.organization);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (data) => {
    setError(null);
    try {
      const result = await authApi.register(data);
      apiClient.setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      setOrganization(result.organization);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setOrganization(null);
  };

  const value = {
    user,
    organization,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
