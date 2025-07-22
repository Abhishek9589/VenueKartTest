import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Building } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("client");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();

  const from = location.state?.from || "/";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const credentials = {
      email: formData.email,
      password: formData.password,
      userType: userType,
    };

    try {
      const result = await login(credentials);

      if (result.success) {
        // Redirect based on user type or original destination
        if (userType === "venue_owner") {
          navigate("/admin/dashboard");
        } else {
          navigate(from, { replace: true });
        }
      }
      // Error handling is done in AuthContext and will show in UI
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    // Facebook login logic would go here
    console.log("Facebook login clicked");
  };

  return (
    <div className="min-h-screen bg-venue-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 mb-8 group"
          >
                        <img
              src="https://cdn.builder.io/api/v1/image/assets%2F317fd6eb2bf64600868e324db448b428%2F64862cb0fd1849b4871cf34916b603a2?format=webp&width=800"
              alt="VenueKart Logo"
              className="w-10 h-10 rounded-lg transition-transform-smooth group-hover:scale-110 group-hover:rotate-6"
            />
                        <span className="text-2xl font-bold text-venue-text-dark transition-colors-smooth group-hover:text-venue-purple">
              VenueKart
            </span>
          </Link>
                    <h2 className="text-3xl font-bold text-venue-text-dark">Welcome Back</h2>
          <p className="mt-2 text-venue-text-secondary">
            Sign in to your account to continue
          </p>
          {location.state?.message && (
            <div className="mt-4 p-3 bg-venue-purple-lighter rounded-lg">
              <p className="text-venue-purple-dark text-sm">{location.state.message}</p>
            </div>
          )}
        </div>

        {/* Sign In Form */}
        <div
                    className="bg-white rounded-lg shadow-lg p-8 animate-stagger-1 hover-glow transition-all-smooth"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-venue-text-dark mb-3">
                I am signing in as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType("client")}
                  className={`p-4 border-2 rounded-lg text-center transition-all-smooth ${
                    userType === "client"
                      ? "border-venue-primary-accent bg-venue-secondary-bg text-venue-primary-accent"
                      : "border-venue-border hover:border-venue-secondary-accent"
                  }`}
                >
                  <User className="mx-auto mb-2" size={24} />
                  <div className="font-medium">Client</div>
                  <div className="text-sm text-venue-text-secondary">Looking for venues</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("venue_owner")}
                  className={`p-4 border-2 rounded-lg text-center transition-all-smooth ${
                    userType === "venue_owner"
                      ? "border-venue-primary-accent bg-venue-secondary-bg text-venue-primary-accent"
                      : "border-venue-border hover:border-venue-secondary-accent"
                  }`}
                >
                  <Building className="mx-auto mb-2" size={24} />
                  <div className="font-medium">Venue Owner</div>
                  <div className="text-sm text-venue-text-secondary">List my venues</div>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-venue-error/10 border border-venue-error rounded-lg">
                <p className="text-venue-error text-sm">{error}</p>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-venue-error hover:text-venue-error/80 text-xs mt-1 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                                className="block text-sm font-medium text-venue-text-dark mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-venue-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent focus:border-transparent transition-all-smooth"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                                className="block text-sm font-medium text-venue-text-dark mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-venue-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                                    className="block w-full pl-10 pr-12 py-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent focus:border-transparent transition-all-smooth"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-transform-smooth hover:scale-110"
                >
                  {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-venue-text-secondary hover:text-venue-primary-accent transition-colors-smooth" />
                  ) : (
                                        <Eye className="h-5 w-5 text-venue-text-secondary hover:text-venue-primary-accent transition-colors-smooth" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                                    className="h-4 w-4 text-venue-primary-accent focus:ring-venue-primary-accent border-venue-border rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-venue-text-primary"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                                className="text-sm text-venue-purple hover:text-venue-text-dark"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 px-4 rounded-lg font-semibold hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-venue-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-venue-text-secondary">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-venue-border rounded-lg hover:bg-venue-muted-bg transition-all-smooth hover:scale-105 hover-glow"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-venue-text-primary font-medium">
                Continue with Google
              </span>
            </button>

            <button
              onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-venue-border rounded-lg hover:bg-venue-muted-bg transition-all-smooth hover:scale-105 hover-glow"
            >
              <svg
                className="w-5 h-5 mr-3 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-venue-text-primary font-medium">
                Continue with Facebook
              </span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-venue-text-secondary">
              Don't have an account?{" "}
              <Link
                to="/signup"
                                className="text-venue-purple hover:text-venue-text-dark font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
