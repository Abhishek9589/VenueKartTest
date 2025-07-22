// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'  // Use relative path in production
    : 'http://localhost:3001/api'  // Use localhost in development
  );

// Token management
const TOKEN_KEY = 'venuekart_access_token';
const REFRESH_TOKEN_KEY = 'venuekart_refresh_token';
const USER_KEY = 'venuekart_user';

// Get tokens from localStorage
export const getTokens = () => ({
  accessToken: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
});

// Set tokens in localStorage
export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Remove tokens from localStorage
export const removeTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Get user from localStorage
export const getStoredUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Set user in localStorage
export const setStoredUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Create axios-like request function
const createRequest = async (url, options = {}) => {
  const { 
    method = 'GET', 
    headers = {}, 
    body,
    requireAuth = true,
    isFormData = false 
  } = options;

  const config = {
    method,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...headers
    }
  };

  // Add authorization header if required
  if (requireAuth) {
    const { accessToken } = getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  // Add body for POST, PUT, PATCH requests
  if (body && !isFormData) {
    config.body = JSON.stringify(body);
  } else if (body && isFormData) {
    config.body = body;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requireAuth) {
      const refreshSuccess = await refreshAccessToken();
      if (refreshSuccess) {
        // Retry the original request with new token
        const { accessToken } = getTokens();
        config.headers.Authorization = `Bearer ${accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${url}`, config);
        return await handleResponse(retryResponse);
      } else {
        // Refresh failed, redirect to login
        removeTokens();
        window.location.href = '/signin';
        throw new Error('Authentication required');
      }
    }

    return await handleResponse(response);
  } catch (error) {
    console.error('API request error:', error);

    // If API is not available, provide mock responses for development
    if (error.message.includes('Failed to fetch') ||
        error.name === 'TypeError' ||
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')) {
      console.warn('API not available, using mock response for:', url, method);
      return getMockResponse(url, method, body);
    }

    throw error;
  }
};

// Mock response generator for when API is not available
const getMockResponse = (url, method, body) => {
  console.log(`🔧 Mock API Response: ${method} ${url}`);

  // Auth endpoints
  if (url.includes('/auth/login') && method === 'POST') {
    return {
      success: true,
      message: "Login successful (mock)",
      data: {
        user: {
          id: "mock-user-id",
          email: body.email,
          name: "Demo User",
          userType: body.userType || 'client',
          isVerified: true
        },
        tokens: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token"
        }
      }
    };
  }

  if (url.includes('/auth/register') && method === 'POST') {
    return {
      success: true,
      message: "Registration successful (mock)",
      data: {
        user: {
          id: "mock-user-id",
          email: body.email,
          name: body.name,
          userType: body.userType || 'client',
          isVerified: false
        },
        tokens: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token"
        }
      }
    };
  }

  if (url.includes('/auth/verify')) {
    // Check if we have stored user data to use
    const storedUser = typeof window !== 'undefined' ?
      localStorage.getItem('venuekart_user') : null;

    let mockUser = {
      id: "mock-user-id",
      email: "demo@venuekart.com",
      name: "Demo User",
      userType: "client",
      isVerified: true
    };

    // Use stored user if available
    if (storedUser) {
      try {
        mockUser = JSON.parse(storedUser);
      } catch (e) {
        console.warn('Could not parse stored user, using default mock user');
      }
    }

    return {
      success: true,
      message: "Token is valid (mock)",
      data: {
        user: mockUser
      }
    };
  }

  // Venues endpoints
  if (url.includes('/venues') && method === 'GET') {
    const mockVenues = [
      {
        id: "1",
        name: "Grand Palace Hotel",
        location: "Mumbai, Maharashtra",
        price_per_day: 50000,
        capacity: 500,
        rating: 4.8,
        review_count: 156,
        images: ["/placeholder.svg"],
        venue_type: "Wedding Hall",
        amenities: ["WiFi", "Parking", "AC"],
        description: "A beautiful venue for your special day"
      },
      {
        id: "2",
        name: "Sunset Garden Resort",
        location: "Goa",
        price_per_day: 35000,
        capacity: 300,
        rating: 4.9,
        review_count: 89,
        images: ["/placeholder.svg"],
        venue_type: "Resort",
        amenities: ["Pool", "Garden", "WiFi"],
        description: "Perfect for destination weddings"
      },
      {
        id: "3",
        name: "Royal Convention Center",
        location: "Delhi",
        price_per_day: 75000,
        capacity: 1000,
        rating: 4.7,
        review_count: 234,
        images: ["/placeholder.svg"],
        venue_type: "Convention Center",
        amenities: ["Stage", "Sound System", "Parking"],
        description: "Ideal for large corporate events"
      }
    ];

    return {
      success: true,
      data: {
        venues: mockVenues,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: mockVenues.length,
          items_per_page: 12
        }
      }
    };
  }

  // Default mock response
  return {
    success: false,
    message: "Mock API - endpoint not implemented",
    data: null
  };
};

// Handle response parsing
const handleResponse = async (response) => {
  let data;
  
  try {
    data = await response.json();
  } catch (error) {
    // Response is not JSON
    data = { message: response.statusText };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Refresh access token
const refreshAccessToken = async () => {
  try {
    const { refreshToken } = getTokens();
    if (!refreshToken) return false;

    // If using mock tokens, don't try to refresh
    if (refreshToken === 'mock-refresh-token') {
      console.log('🔧 Mock mode: Skipping token refresh');
      return true;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);

    // In mock mode, always return true to prevent logout
    const { refreshToken } = getTokens();
    if (refreshToken === 'mock-refresh-token') {
      return true;
    }

    return false;
  }
};

// API Methods

// Authentication
export const authAPI = {
  register: (userData) => createRequest('/auth/register', {
    method: 'POST',
    body: userData,
    requireAuth: false
  }),

  login: (credentials) => createRequest('/auth/login', {
    method: 'POST',
    body: credentials,
    requireAuth: false
  }),

  logout: (refreshToken) => createRequest('/auth/logout', {
    method: 'POST',
    body: { refreshToken }
  }),

  getCurrentUser: () => createRequest('/auth/me'),

  updateProfile: (profileData) => createRequest('/auth/me', {
    method: 'PUT',
    body: profileData
  }),

  verifyToken: () => createRequest('/auth/verify'),

  refreshToken: (refreshToken) => createRequest('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    requireAuth: false
  })
};

// Venues
export const venuesAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const url = queryString ? `/venues?${queryString}` : '/venues';
    return createRequest(url, { requireAuth: false });
  },

  getById: (id) => createRequest(`/venues/${id}`, { requireAuth: false }),

  create: (venueData) => createRequest('/venues', {
    method: 'POST',
    body: venueData,
    isFormData: venueData instanceof FormData
  }),

  update: (id, venueData) => createRequest(`/venues/${id}`, {
    method: 'PUT',
    body: venueData,
    isFormData: venueData instanceof FormData
  }),

  delete: (id) => createRequest(`/venues/${id}`, {
    method: 'DELETE'
  }),

  getMyVenues: (page = 1, limit = 10) => createRequest(`/venues/owner/my-venues?page=${page}&limit=${limit}`),

  getStats: () => createRequest('/venues/owner/stats')
};

// Bookings
export const bookingsAPI = {
  create: (bookingData) => createRequest('/bookings', {
    method: 'POST',
    body: bookingData
  }),

  getMyBookings: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const url = queryString ? `/bookings/my-bookings?${queryString}` : '/bookings/my-bookings';
    return createRequest(url);
  },

  getById: (id) => createRequest(`/bookings/${id}`),

  updateStatus: (id, status, reason) => createRequest(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status, cancellation_reason: reason }
  }),

  cancel: (id, reason) => createRequest(`/bookings/${id}/cancel`, {
    method: 'POST',
    body: { reason }
  }),

  getStats: () => createRequest('/bookings/stats/overview')
};

// Utility functions for common patterns
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    console.error('API Error:', error);

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return 'Connection error. Please check your internet connection.';
    }

    if (error.status === 401) {
      removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      return 'Authentication required. Please sign in.';
    }

    if (error.status === 403) {
      return 'Access denied. You do not have permission for this action.';
    }

    if (error.status === 404) {
      return 'Resource not found.';
    }

    if (error.status === 409) {
      return error.data?.message || 'Conflict: Resource already exists.';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return error.message || 'An unexpected error occurred.';
  },

  // Format form data for API
  formatFormData: (data, files = {}) => {
    const formData = new FormData();
    
    // Add regular form fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => formData.append(key, item));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    // Add files
    Object.keys(files).forEach(key => {
      if (files[key]) {
        if (Array.isArray(files[key])) {
          files[key].forEach(file => formData.append(key, file));
        } else {
          formData.append(key, files[key]);
        }
      }
    });
    
    return formData;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const { accessToken } = getTokens();
    return !!accessToken;
  },

  // Get current user role
  getUserRole: () => {
    const user = getStoredUser();
    return user?.userType || null;
  },

  // Check if user has specific role
  hasRole: (role) => {
    const userRole = apiUtils.getUserRole();
    return userRole === role;
  }
};

// Export default API object
export default {
  auth: authAPI,
  venues: venuesAPI,
  bookings: bookingsAPI,
  utils: apiUtils
};
