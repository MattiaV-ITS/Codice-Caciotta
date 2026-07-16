import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'jwtToken';
const USER_KEY = 'userData';

const normalizeToken = (value) => (value && value !== 'undefined' && value !== 'null' ? value : null);

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    // Formato JWT : header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    
    if (!exp) return false; // Nessuna scadenza indicata, consideriamo il token valido
    
    // Controlla se il token è scaduto (con buffer di 60 secondi)
    return Date.now() >= exp * 1000 - 60000;
  } catch (e) {
    return true;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(normalizeToken(localStorage.getItem(TOKEN_KEY)));
  const [isLoading, setIsLoading] = useState(true);
  
  // Debug dello stato del token
  useEffect(() => {
    console.log('AuthContext token state:', token ? token.substring(0, 20) + '...' : 'null');
  }, [token]);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    
    // Controlla se il token è scaduto
    if (token && isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
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
    
    // Valida il token prima di memorizzarlo
    if (isTokenExpired(normalizedToken)) {
      throw new Error('Received token is already expired');
    }

    localStorage.setItem(TOKEN_KEY, normalizedToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(normalizedToken);
    setUser(userData);
  };

  const updateUser = (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => !!token && !isTokenExpired(token);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isLoading, updateUser }}>
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
