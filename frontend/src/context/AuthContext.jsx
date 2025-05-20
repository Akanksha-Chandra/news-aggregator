import React, { createContext, useState, useContext, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  // Register a new user
  const register = async (email, name, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Save user and token to state and local storage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      return data.user;
    } catch (error) {
      setError(error.message);
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Save user and token to state and local storage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      return data.user;
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Get current user
  const getCurrentUser = async () => {
    if (!token) {
      return null;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, log out user
          logout();
        }
        throw new Error(data.error || 'Failed to get user');
      }
      
      // Update user in state and local storage
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Make authenticated API requests
  const authFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, log out user
          logout();
        }
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('Auth fetch error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    error,
    register,
    login,
    logout,
    getCurrentUser,
    authFetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;