import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email);
      setIsSubmitting(false);

      // Always show a success message even if the email doesn't exist
      // This prevents user enumeration
      setSuccess(true);
      setEmail("");
    } catch (error) {
      setIsSubmitting(false);
      setError(
        error.response?.data?.error ||
          "Failed to send reset link. Please try again."
      );
      console.error("Forgot password error:", error);
    }
  };

  return (
    <Layout requireAuth={false} title="Forgot Password">
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Password reset email sent
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      If an account exists with this email, you will receive a
                      password reset link shortly.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/login"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Return to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="-space-y-px rounded-md shadow-sm">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className={`group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                  ${
                    isSubmitting || !email
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </div>

              <div className="text-sm text-center">
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
