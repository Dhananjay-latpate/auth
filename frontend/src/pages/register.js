import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();
  const auth = useAuth();
  const password = watch("password", "");

  // Track if this is an admin creating a new user
  const [isAdminAction, setIsAdminAction] = useState(false);

  // Check if this is an admin creating a new user when router is ready
  useEffect(() => {
    if (router.isReady) {
      const fromDashboard = router.query.from === "dashboard";
      const adminAction = router.query.admin_action === "true";

      if (fromDashboard && adminAction) {
        setIsAdminAction(true);
        console.log("Admin user creation page detected");
      } else if (auth.user && !isAdminAction) {
        // If user is already logged in and not performing admin action,
        // redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [router.isReady, router.query]);

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = data;

      // If this is admin action, add flag for backend
      if (isAdminAction) {
        registrationData.createdByAdmin = true;
      }

      await auth.register(registrationData);

      // If admin is creating a user, show success and don't redirect
      if (isAdminAction) {
        setSuccess(`User ${data.name} has been created successfully!`);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);

      // Handle specific error types
      if (err.response?.status === 409 || err.response?.data?.code === 11000) {
        setError(
          "This email is already registered. Please try using a different email address."
        );

        // Highlight the email field
        document.getElementById("email")?.classList.add("border-red-500");
      } else if (err.response?.data?.validationError) {
        setError(
          err.response.data.error ||
            "Please check your information and try again."
        );
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error when user types in email field
  const handleEmailFocus = () => {
    document.getElementById("email")?.classList.remove("border-red-500");
    if (error && error.includes("email is already registered")) {
      setError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>
          {isAdminAction ? "Create New User" : "Register"} - Secure Auth System
        </title>
      </Head>

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {isAdminAction ? (
          <div className="mb-6">
            <h1 className="text-center text-2xl font-bold text-gray-900">
              Create New User
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              You are creating a user as an administrator
            </p>
          </div>
        ) : (
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Create Your Account
          </h1>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 mb-4 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className="form-control"
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

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
              onFocus={handleEmailFocus}
              className="form-control"
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
              className="form-control"
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="form-control"
            />
            {errors.confirmPassword && (
              <span className="error-message">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isAdminAction
                ? "Create User"
                : "Register"}
            </button>
          </div>
        </form>

        {!isAdminAction && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login">
              <span className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
                Login
              </span>
            </Link>
          </p>
        )}

        {isAdminAction && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              ← Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
