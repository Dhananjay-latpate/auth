import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { getCookie, deleteCookie } from "cookies-next";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();
  const { logged_out, callbackUrl } = router.query;
  const auth = useAuth();

  // This useEffect ensures that previous auth state is properly cleaned up
  useEffect(() => {
    // Clear any redirect state to prevent loops
    localStorage.removeItem("isLoggingOut");

    // Ensure all token checks run properly on mount
    const handleTokenCleanup = () => {
      // If logged_out parameter is present, we've just performed a logout
      if (logged_out === "true") {
        console.log("Login page - detected logged_out=true, clearing tokens");
        deleteCookie("token", { path: "/" });
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        // Show success message
        setSuccessMessage("You have been successfully logged out.");

        // Clear the query parameter after a delay for cleaner URL
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("logged_out");
          url.searchParams.delete("t");
          window.history.replaceState({}, document.title, url.toString());
        }, 500);
      }
      // Regular login page visit - check for stale tokens
      else {
        // Check for both token sources
        const cookieToken = getCookie("token");
        const localToken = localStorage.getItem("auth_token");

        // If coming from direct URL entry with token present, clear tokens
        const directEntry =
          !document.referrer ||
          document.referrer.indexOf(window.location.host) === -1;
        
        const hasTokenParam = router.query.t;

        if ((cookieToken || localToken) && directEntry && hasTokenParam ) {
          console.log(
            "Login page visited directly with tokens present, clearing stale tokens"
          );
          deleteCookie("token", { path: "/" });
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
        }
      }
    };

    // Run token cleanup when component mounts
    handleTokenCleanup();

    // Return cleanup function
    return () => {
      // No cleanup needed
    };
  }, [logged_out]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Call the login function from auth context
      await auth.login(data);
      // Direct navigation is now handled in the login function
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Login - Secure Auth System</title>
      </Head>

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
          Login to Your Account
        </h1>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 mb-4 rounded-md">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md">
            {error}
          </div>
        )}

        {auth.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md">
            {auth.error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Please enter a valid email",
                },
              })}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <Link href="/forgot-password">
              <span className="text-sm text-primary-600 hover:text-primary-500 cursor-pointer">
                Forgot your password?
              </span>
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register">
            <span className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
              Register
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
