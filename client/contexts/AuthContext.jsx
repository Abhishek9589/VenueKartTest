import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  authAPI, 
  setTokens, 
  removeTokens, 
  getStoredUser, 
  setStoredUser,
  getTokens,
  apiUtils 
} from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && apiUtils.isAuthenticated();
  };

  // Load user from localStorage and verify token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        const { accessToken } = getTokens();

        if (storedUser && accessToken && accessToken !== 'null' && accessToken !== 'undefined') {
          // For mock tokens, skip verification and use stored user
          if (accessToken === 'mock-access-token') {
            console.log('🔧 Mock mode: Using stored user data');
            setUser(storedUser);
            setIsDemoMode(true);
            return;
          }

          // Verify token is still valid for real tokens
          try {
            const response = await authAPI.verifyToken();
            setUser(response.data.user);

            // Check if this is a mock response
            if (response.message && response.message.includes('mock')) {
              setIsDemoMode(true);
            }
          } catch (error) {
            console.warn('Token verification failed, clearing auth:', error.message);
            // Token is invalid, clear everything
            removeTokens();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't clear tokens on initialization errors - they might be temporary network issues
        if (error.message && error.message.includes('Failed to fetch')) {
          console.log('🔧 Network error during auth init, using stored user if available');
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsDemoMode(true);
          }
        } else {
          removeTokens();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(userData);

      if (response.success) {
        const { user: newUser, tokens } = response.data;

        // Check if this is a mock response
        if (tokens.accessToken === 'mock-access-token') {
          setIsDemoMode(true);
          console.log('🔧 Running in demo mode with mock authentication');
        }

        setTokens(tokens.accessToken, tokens.refreshToken);
        setStoredUser(newUser);
        setUser(newUser);

        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(credentials);

      if (response.success) {
        const { user: loggedInUser, tokens } = response.data;

        // Check if this is a mock response
        if (tokens.accessToken === 'mock-access-token') {
          setIsDemoMode(true);
          console.log('🔧 Running in demo mode with mock authentication');
        }

        setTokens(tokens.accessToken, tokens.refreshToken);
        setStoredUser(loggedInUser);
        setUser(loggedInUser);

        return { success: true, user: loggedInUser };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    
    try {
      const { refreshToken } = getTokens();
      
      if (refreshToken) {
        // Attempt to logout on server (revoke refresh token)
        try {
          await authAPI.logout(refreshToken);
        } catch (error) {
          // Even if server logout fails, continue with client logout
          console.warn('Server logout failed:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear client-side data
      removeTokens();
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = response.data.user;
        setStoredUser(updatedUser);
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.success) {
        const updatedUser = response.data.user;
        setStoredUser(updatedUser);
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, user might be logged out
      if (error.status === 401) {
        removeTokens();
        setUser(null);
      }
    }
    
    return null;
  };

  // Handle Google OAuth callback
  const handleGoogleCallback = (urlParams) => {
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refresh');
    const userParam = urlParams.get('user');

    if (token && refreshToken && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        setTokens(token, refreshToken);
        setStoredUser(userData);
        setUser(userData);
        
        return { success: true, user: userData };
      } catch (error) {
        console.error('Google callback error:', error);
        return { success: false, error: 'Failed to process Google authentication' };
      }
    }

    return { success: false, error: 'Invalid authentication data' };
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Check user role
  const hasRole = (role) => {
    return user?.userType === role;
  };

  // Check if user is venue owner
  const isVenueOwner = () => hasRole('venue_owner');

  // Check if user is client
  const isClient = () => hasRole('client');

  const value = {
    user,
    loading,
    error,
    isDemoMode,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    refreshUser,
    handleGoogleCallback,
    clearError,
    hasRole,
    isVenueOwner,
    isClient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
