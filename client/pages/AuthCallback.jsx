import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        
        // Check if there's an error
        const error = urlParams.get('error');
        if (error) {
          console.error('OAuth error:', error);
          navigate('/signin', { 
            state: { 
              message: 'Authentication failed. Please try again.' 
            } 
          });
          return;
        }

        // Handle successful Google authentication
        const result = handleGoogleCallback(urlParams);
        
        if (result.success) {
          const user = result.user;
          
          // Redirect based on user type
          if (user.userType === 'venue_owner') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/signin', { 
            state: { 
              message: result.error || 'Authentication failed. Please try again.' 
            } 
          });
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        navigate('/signin', { 
          state: { 
            message: 'Authentication failed. Please try again.' 
          } 
        });
      }
    };

    processCallback();
  }, [location, navigate, handleGoogleCallback]);

  return (
    <div className="min-h-screen bg-venue-primary-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-venue-primary-accent"></div>
        </div>
        <h2 className="text-xl font-semibold text-venue-text-primary mb-2">
          Completing Authentication...
        </h2>
        <p className="text-venue-text-secondary">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
