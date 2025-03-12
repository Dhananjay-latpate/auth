import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { resetPassword, verifyResetToken } = useAuth();
  const router = useRouter();
  const { token } = router.query;

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          setIsVerifying(true);
          const result = await verifyResetToken(token);
          if (result.success) {
            setIsValidToken(true);
          } else {
            setTokenError(result.error || 'Invalid or expired token');
          }
        } catch (error) {
          setTokenError('Failed to verify token. It may be invalid or expired.');
          console.error('Token verification error:', error);
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyToken();
  }, [token, verifyResetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await resetPassword(token, password, confirmPassword);
      
      if (result.success) {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
      console.error('Reset password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <Layout requireAuth={false} title="Verifying Reset Token">
        <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              Verifying your reset token...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isValidToken) {
    return (
      <Layout requireAuth={false} title="Invalid Reset Token">
        <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Invalid Reset Token</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{tokenError || 'Your password reset link is invalid or has expired.'}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/forgot-password"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={false} title="Reset Password">
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Set your new password
            </h2>
          </div>

          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Password reset successful
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your password has been reset successfully.</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/login"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Go to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters and include uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !password || !confirmPassword}
                  className={`group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                  ${
                    isSubmitting || !password || !confirmPassword
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
