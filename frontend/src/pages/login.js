import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import TwoFactorAuthentication from "../components/TwoFactorAuthentication";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const { login, error, requiresTwoFactor } = useAuth();
  const router = useRouter();

  // Clear local error when global error changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // Check for logged_out parameter
  useEffect(() => {
    if (router.query.logged_out) {
      setLocalError("You have been logged out.");
      setTimeout(() => setLocalError(""), 3000);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError("");

    try {
      const result = await login({ email, password });

      // If two-factor auth is required, the component will be shown
      if (result?.requireTwoFactor) {
        // Don't reset the form or redirect, the 2FA component will handle that
        console.log("Two-factor authentication required");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLocalError(
        error.response?.data?.error || "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // If two-factor authentication is required, show the 2FA component
  if (requiresTwoFactor) {
    return (
      <Layout requireAuth={false} title="Two-Factor Authentication">
        <TwoFactorAuthentication />
      </Layout>
    );
  }

  return (
    <Layout requireAuth={false} title="Login">
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                create a new account
              </Link>
            </p>
          </div>

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
                  className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {localError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {localError}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
