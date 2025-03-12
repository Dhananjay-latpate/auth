import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import Head from "next/head";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgotpassword`,
        data
      );

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      setFormError(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Forgot Password - Secure Auth System</title>
      </Head>

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
          Forgot Password
        </h1>

        {success ? (
          <div className="text-center">
            <div className="alert alert-success mb-6">
              Password reset link has been sent to your email.
            </div>
            <p className="mb-4 text-gray-600">
              Please check your email for instructions to reset your password.
            </p>
            <Link href="/login">
              <button className="btn btn-primary">Return to Login</button>
            </Link>
          </div>
        ) : (
          <>
            {formError && <div className="alert alert-error">{formError}</div>}

            <p className="mb-6 text-gray-600">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

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

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Reset Password"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link href="/login">
                <span className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
                  Sign in
                </span>
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
