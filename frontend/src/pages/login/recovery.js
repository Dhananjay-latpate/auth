import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { setCookie } from "cookies-next";
import Head from "next/head";
import Link from "next/link";

export default function RecoveryCodeVerification() {
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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/verify-recovery`,
        {
          email,
          recoveryCode: data.recoveryCode,
        }
      );

      if (response.data.success) {
        setCookie("token", response.data.token);
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid recovery code");
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
        <title>Recovery Code - Secure Auth System</title>
      </Head>

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
          Enter Recovery Code
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Please enter one of your recovery codes to access your account
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label
              htmlFor="recoveryCode"
              className="block text-sm font-medium text-gray-700"
            >
              Recovery Code
            </label>
            <input
              id="recoveryCode"
              type="text"
              autoFocus
              placeholder="Enter your recovery code"
              {...register("recoveryCode", {
                required: "Recovery code is required",
              })}
              className={`form-control ${
                errors.recoveryCode ? "is-invalid" : ""
              }`}
            />
            {errors.recoveryCode && (
              <span className="error-message">
                {errors.recoveryCode.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <Link href="/login">
            <span className="text-sm text-primary-600 hover:text-primary-500 cursor-pointer">
              ← Back to login
            </span>
          </Link>

          <button
            onClick={() => router.push("/login/verify-2fa?email=" + email)}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Use authenticator app instead
          </button>
        </div>
      </div>
    </div>
  );
}
