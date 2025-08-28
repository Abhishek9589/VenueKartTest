import apiClient from '../lib/apiClient.js';
import { getUserFriendlyError } from '../lib/errorMessages.js';

const API_BASE = '/api/auth';

class AuthService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async login(email, password) {
    try {
      const data = await apiClient.postJson(`${API_BASE}/login`, { email, password });

      // Store tokens
      this.setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      // Convert to user-friendly signin-specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'signin');
      throw new Error(userFriendlyMessage);
    }
  }

  async register(email, name, userType = 'customer', password = null, mobileNumber = null) {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, userType, password, mobileNumber }),
      });

      // Handle response more safely
      let data = null;
      let responseText = '';

      try {
        // First try to get the response as text
        responseText = await response.text();

        // Then try to parse it as JSON
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch (jsonError) {
        console.error('Failed to parse register response:', jsonError);
        console.error('Response text:', responseText);

        // If we can't parse JSON but have response text, use generic error
        if (!response.ok) {
          throw new Error('Registration failed. Please try again.');
        }

        data = null;
      }

      if (!response.ok) {
        const errorMessage = data && data.error ? data.error : 'Registration failed';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      // Convert to user-friendly signup-specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'signup');
      throw new Error(userFriendlyMessage);
    }
  }

  async verifyOTP(email, otp) {
    try {
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse verifyOTP response as JSON:', jsonError);
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data && data.error ? data.error : 'OTP verification failed';
        throw new Error(errorMessage);
      }
      // Store tokens
      this.setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      // Convert to user-friendly OTP-specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'otp');
      throw new Error(userFriendlyMessage);
    }
  }

  async resendOTP(email) {
    try {
      const response = await fetch(`${API_BASE}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse resendOTP response as JSON:', jsonError);
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data && data.error ? data.error : 'Failed to resend OTP';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      // Convert to user-friendly OTP-specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'otp');
      throw new Error(userFriendlyMessage);
    }
  }

  async getCurrentUser() {
    if (!this.accessToken) {
      return null;
    }

    try {
      return await apiClient.getJson(`${API_BASE}/me`);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const data = await apiClient.postJson(`${API_BASE}/refresh`, { refreshToken: this.refreshToken });
      this.setTokens(data.accessToken, this.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return false;
    }
  }

  async logout() {
    try {
      if (this.accessToken) {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    // Update apiClient tokens as well
    apiClient.setTokens(accessToken, refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Clear old user data
    // Clear apiClient tokens as well
    apiClient.clearTokens();
  }

  initiateGoogleAuth(userType = 'customer') {
    return new Promise((resolve, reject) => {
      // Open Google auth in popup to avoid iframe restrictions
      const width = 500;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      // Include userType as a query parameter
      const authUrl = `${API_BASE}/google?userType=${encodeURIComponent(userType)}`;

      const popup = window.open(
        authUrl,
        'googleAuth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups and try again.'));
        return;
      }

      let isResolved = false;

      // Listen for messages from popup
      const messageListener = (event) => {
        // Allow messages from current origin
        const allowedOrigins = [window.location.origin, `${window.location.protocol}//${window.location.host}`];
        if (!allowedOrigins.includes(event.origin)) {
          console.log('Ignored message from:', event.origin);
          return;
        }

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          isResolved = true;
          clearInterval(checkClosed);
          this.setTokens(event.data.accessToken, event.data.refreshToken);
          window.removeEventListener('message', messageListener);
          resolve(event.data);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          isResolved = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error(event.data.error || 'Google authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);

      // Listen for popup to close (fallback) - give some time for message processing
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          // Give a small delay to allow message processing
          setTimeout(() => {
            if (!isResolved) {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              reject(new Error('Authentication cancelled'));
            }
          }, 500);
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!isResolved) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Authentication timeout'));
        }
      }, 300000);
    });
  }

  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse forgotPassword response as JSON:', jsonError);
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data && data.error ? data.error : 'Failed to send reset email';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      // Convert to user-friendly password-reset specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'password-reset');
      throw new Error(userFriendlyMessage);
    }
  }

  async resetPassword(email, otp, newPassword) {
    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse resetPassword response as JSON:', jsonError);
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data && data.error ? data.error : 'Failed to reset password';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      // Convert to user-friendly password-reset specific error message
      const userFriendlyMessage = getUserFriendlyError(error.message || error, 'password-reset');
      throw new Error(userFriendlyMessage);
    }
  }

  // Handle OAuth callback tokens from URL
  handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const error = urlParams.get('error');

    if (error) {
      throw new Error('Authentication failed');
    }

    if (accessToken && refreshToken) {
      this.setTokens(accessToken, refreshToken);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }

    return false;
  }
}

export default new AuthService();
