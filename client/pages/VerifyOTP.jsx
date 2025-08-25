import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;
  const name = location.state?.name;

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit code');
      }

      await verifyOTP(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      await resendOTP(email);
      setTimeLeft(600); // Reset timer
      setOtp(''); // Clear OTP input
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-venue-dark mb-2">Verify Your Email</h1>
          <p className="text-gray-600">We've sent a verification code to</p>
          <p className="font-medium text-venue-indigo">{email}</p>
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                      }}
                      placeholder="Enter 6-digit code"
                      className="pl-10 h-12 border-gray-300 focus:border-venue-indigo focus:ring-venue-indigo text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Code expires in {formatTime(timeLeft)}</span>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-venue-indigo hover:bg-venue-purple text-white font-medium text-base disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>

              {/* Resend Option */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the code?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={resendLoading || timeLeft > 0}
                  className="border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white"
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </Button>
              </div>

              {/* Back Link */}
              <div className="text-center mt-6">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/signup')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
