import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import Head from "next/head";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const password = watch("password");

  const onSubmit = async (data) => {
    if (!token) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/resetpassword/${token}`,
        { password: data.password }
      );
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setFormError(
        error.response?.data?.error ||
          "Password reset failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Verify token validity when component mounts
    if (token) {
      const verifyToken = async () => {
        try {
          await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verifytoken/${token}`
          );
        } catch (error) {
          setIsValidToken(false);
        }
      };

      verifyToken();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Invalid or Expired Token
          </h1>
          <div className="alert alert-error">
            This password reset link is invalid or has expired.
          </div>
          <div className="mt-6 text-center">
            <Link href="/forgot-password">
              <button className="btn btn-primary">Request a new link</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Reset Password - Secure Auth System</title>
      </Head>

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
          Reset Your Password
        </h1>

        {success ? (
          <div className="text-center">
            <div className="alert alert-success mb-6">
              Your password has been reset successfully!
            </div>
            <p className="mb-4 text-gray-600">
              You will be redirected to the login page in a few seconds.
            </p>
          </div>
        ) : (
          <>
            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
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
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                    },
                  })}
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                />
                {errors.password && (
                  <span className="error-message">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className={`form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                />
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
