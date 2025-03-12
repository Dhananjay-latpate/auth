import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { setCookie } from "cookies-next";
import Head from "next/head";
import Link from "next/link";

export default function TwoFactorVerification() {
  const router = useRouter();
  const { email } = router.query;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Submitting 2FA verification for:", email);
      console.log("Token:", data.token);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/verify`,
        {
          email,
          token: data.token,
        }
      );

      console.log("2FA verification response:", response.data);

      if (response.data.success) {
        // Store token in localStorage for persistence
        localStorage.setItem("auth_token", response.data.token);
        
        // Also set cookie
        setCookie("token", response.data.token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/"
        });
        
        console.log("Token stored after 2FA verification");
        
        // Ensure axios default headers are set
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Hard navigate to dashboard to ensure fresh state
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setError(err.response?.data?.error || "Invalid verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Two-Factor Verification - Secure Auth System</title>
      </Head>

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
          Two-Factor Authentication
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Please enter the verification code from your authenticator app
        </p>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700"
            >
              Verification Code
            </label>
            <input
              id="token"
              type="text"
              autoFocus
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              {...register("token", {
                required: "Verification code is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Must be a 6-digit code",
                },
              })}
              className={`form-control ${errors.token ? "is-invalid" : ""}`}
            />
            {errors.token && (
              <span className="error-message">{errors.token.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary mt-4"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <Link href="/login">
            <span className="text-sm text-primary-600 hover:text-primary-500 cursor-pointer">
              ← Back to login
            </span>
          </Link>

          <Link href={`/login/recovery?email=${encodeURIComponent(email)}`}>
            <span className="text-sm text-primary-600 hover:text-primary-500 cursor-pointer">
              Use recovery code
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
