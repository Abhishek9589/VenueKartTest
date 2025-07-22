import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Building } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState("client");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    clearError();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions!");
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      userType: userType,
    };

    try {
      const result = await register(userData);

      if (result.success) {
        // Redirect based on user type
        if (userType === "venue_owner") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
      // Error handling is done in AuthContext and will show in UI
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleGoogleSignUp = () => {
    // Redirect to Google OAuth endpoint (same as sign in)
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleFacebookSignUp = () => {
    // Facebook sign up logic would go here
    console.log("Facebook sign up clicked");
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
                    <h2 className="text-3xl font-bold text-venue-text-dark">
            Create Your Account
          </h2>
          <p className="mt-2 text-gray-600">
            Join VenueKart to find amazing venues
          </p>
        </div>

        {/* Sign Up Form */}
        <div
                    className="bg-white rounded-lg shadow-lg p-8 animate-stagger-1 hover-glow transition-all-smooth"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-venue-text-dark mb-3">
                I want to sign up as:
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

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                                className="block text-sm font-medium text-venue-text-dark mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple focus:border-transparent"
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
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-venue-purple" />
                  ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-venue-purple" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-venue-text-dark mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-venue-purple" />
                  ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-venue-purple" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                                className="h-4 w-4 text-venue-purple focus:ring-venue-purple border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm">
                <span className="text-gray-700">I agree to the </span>
                <button
                  type="button"
                                    className="text-venue-purple hover:text-venue-text-dark underline"
                >
                  Terms of Service
                </button>
                <span className="text-gray-700"> and </span>
                <button
                  type="button"
                                    className="text-venue-purple hover:text-venue-text-dark underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or sign up with
                </span>
              </div>
            </div>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
              <span className="text-gray-700 font-medium">
                Sign up with Google
              </span>
            </button>

            <button
              onClick={handleFacebookSignUp}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-3 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-gray-700 font-medium">
                Sign up with Facebook
              </span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                                className="text-venue-purple hover:text-venue-text-dark font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
