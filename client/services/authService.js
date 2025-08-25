const API_BASE = '/api/auth';

class AuthService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Read response body once
      let data = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse login response as JSON:', jsonError);
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data && data.error ? data.error : 'Login failed';
        throw new Error(errorMessage);
      }

      // Store tokens
      this.setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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

      // Read response body once
      let data = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse register response as JSON:', jsonError);
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data && data.error ? data.error : 'Registration failed';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
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
      throw error;
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
      throw error;
    }
  }

  async getCurrentUser() {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.getCurrentUser();
        }
        return null;
      }

      if (!response.ok) {
        return null;
      }

      return await response.json();
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
      const response = await fetch(`${API_BASE}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      let data = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse refresh response as JSON:', jsonError);
        this.clearTokens();
        return false;
      }

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
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Clear old user data
  }

  initiateGoogleAuth() {
    window.location.href = `${API_BASE}/google`;
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
      throw error;
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
      throw error;
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
