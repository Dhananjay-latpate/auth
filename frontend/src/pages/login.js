import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import TwoFactorAuthentication from "../components/TwoFactorAuthentication";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const { login, error, requiresTwoFactor, user } = useAuth();
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

    if (router.query.expired) {
      setLocalError("Your session has expired. Please log in again.");
      setTimeout(() => setLocalError(""), 3000);
    }

    // If user is already authenticated, redirect to dashboard
    // This helps prevent redirect loops when middleware might not catch it
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      router.push("/dashboard?no_redirect=true");
    }
  }, [router.query, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError("");

    console.log(`[Login] Attempting login for ${email}`);

    try {
      const result = await login({ email, password });
      console.log("[Login] Login result:", result);

      // If two-factor auth is required, the component will be shown
      if (result?.requireTwoFactor) {
        console.log("[Login] Two-factor authentication required");
        // Don't reset the form or redirect, the 2FA component will handle that
      } else {
        console.log(
          "[Login] Login successful, redirect should happen automatically"
        );
        // The login function will handle the redirect
      }
    } catch (error) {
      console.error("[Login] Login error:", error);
      setLocalError(
        error.response?.data?.error || "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear form errors if user edits fields
  const handleInputChange = (e) => {
    if (localError) {
      setLocalError("");
    }

    // Update the respective field
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
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
      <Card className="max-w-md mx-auto slide-in" bodyClassName="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
            Sign in to your account
          </h2>
          <p className="text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {localError && (
          <Alert
            type="error"
            message={localError}
            onClose={() => setLocalError("")}
          />
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              value={email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              value={password}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Sign in
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default Login;
