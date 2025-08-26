class ApiClient {
  constructor() {
    this.baseURL = '';
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Process failed requests queue after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Get current tokens
  getTokens() {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    };
  }

  // Set tokens in localStorage
  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Refresh access token using refresh token
  async refreshToken() {
    const { refreshToken } = this.getTokens();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setTokens(data.accessToken, refreshToken);
      return data.accessToken;
    } catch (error) {
      this.clearTokens();
      // Redirect to login page
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin?expired=true';
      }
      throw error;
    }
  }

  // Main API call method with automatic token refresh
  async call(url, options = {}) {
    const { accessToken } = this.getTokens();
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      // Make initial request
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If request succeeds, return response
      if (response.ok) {
        return response;
      }

      // If 401 (unauthorized) and we have a refresh token, try to refresh
      if (response.status === 401 && this.getTokens().refreshToken) {
        return this.handleTokenRefresh(url, options);
      }

      // For other errors, return the response as-is
      return response;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  // Handle token refresh and retry logic
  async handleTokenRefresh(originalUrl, originalOptions) {
    // If already refreshing, add to queue
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        // Retry original request with new token
        return this.call(originalUrl, originalOptions);
      });
    }

    this.isRefreshing = true;

    try {
      // Attempt to refresh token
      const newAccessToken = await this.refreshToken();
      
      // Process queue with success
      this.processQueue(null, newAccessToken);
      
      // Retry original request with new token
      const { refreshToken } = this.getTokens();
      const headers = {
        'Content-Type': 'application/json',
        ...originalOptions.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return fetch(originalUrl, {
        ...originalOptions,
        headers,
      });
    } catch (refreshError) {
      // Process queue with error
      this.processQueue(refreshError, null);
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Convenience methods for common HTTP verbs
  async get(url, options = {}) {
    return this.call(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.call(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(url, data, options = {}) {
    return this.call(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(url, options = {}) {
    return this.call(url, { ...options, method: 'DELETE' });
  }

  // Helper method for API calls that need JSON response
  async callJson(url, options = {}) {
    const response = await this.call(url, options);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    return response.json();
  }

  // JSON convenience methods
  async getJson(url, options = {}) {
    return this.callJson(url, { ...options, method: 'GET' });
  }

  async postJson(url, data, options = {}) {
    return this.callJson(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async putJson(url, data, options = {}) {
    return this.callJson(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJson(url, options = {}) {
    return this.callJson(url, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export default new ApiClient();
