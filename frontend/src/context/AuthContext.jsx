import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'jwtToken';
const USER_KEY = 'userData';

const normalizeToken = (value) => (value && value !== 'undefined' && value !== 'null' ? value : null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(normalizeToken(localStorage.getItem(TOKEN_KEY)));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
      }
    } else if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setIsLoading(false);
  }, [token]);

  const login = (token, userData) => {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken) {
      throw new Error('Invalid authentication token received from server');
    }

    localStorage.setItem(TOKEN_KEY, normalizedToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(normalizedToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isLoading }}>
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
