import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="text-8xl font-bold text-venue-blue mb-4">404</div>
          <h1 className="text-3xl font-bold text-venue-navy mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been
            moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-venue-blue hover:bg-venue-navy text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            <Home size={20} />
            Back to Home
          </Link>

          <div className="text-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-venue-blue hover:text-venue-navy font-medium"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>
            If you believe this is an error, please{" "}
            <Link
              to="/contact"
              className="text-venue-blue hover:text-venue-navy underline"
            >
              contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
