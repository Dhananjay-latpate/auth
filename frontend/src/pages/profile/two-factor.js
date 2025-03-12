import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { getCookie } from "cookies-next";
import Head from "next/head";

export default function TwoFactorAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [setupMode, setSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const setup2FA = async () => {
    try {
      setError(null);
      setIsSubmitting(true);

      const token = getCookie("token") || localStorage.getItem("auth_token");
      console.log("Setting up 2FA with token:", token ? "exists" : "missing");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/setup`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("2FA setup response:", response.data);
      setQrCode(response.data.data.qrCode);
      setSecret(response.data.data.secret);
      setSetupMode(true);
    } catch (err) {
      console.error("2FA setup error:", err);
      setError("Failed to setup 2FA. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const enable2FA = async (data) => {
    try {
      setError(null);
      setIsSubmitting(true);

      console.log("Enabling 2FA with token:", data.token);
      const token = getCookie("token") || localStorage.getItem("auth_token");

      // Make sure we're sending the token correctly
      const payload = {
        token: data.token.trim(),
      };

      console.log("Sending payload to enable 2FA:", payload);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/enable`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("2FA enable response:", response.data);
      setSuccess("Two-factor authentication has been successfully enabled");
      setSetupMode(false);

      // Generate recovery codes right after enabling 2FA
      generateRecoveryCodes();

      // Reload the page after a delay to reflect changes
      setTimeout(() => {
        router.reload();
      }, 5000);
    } catch (err) {
      console.error("2FA enable error:", err);
      if (err.response && err.response.data) {
        console.error("Error response data:", err.response.data);
      }
      setError(
        err.response?.data?.error ||
          "Failed to verify code. Please make sure you entered it correctly."
      );
    } finally {
      setIsSubmitting(false);
      reset();
    }
  };

  const disable2FA = async (data) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const token = getCookie("token") || localStorage.getItem("auth_token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/disable`,
        { token: data.token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("2FA disable response:", response.data);
      setSuccess("Two-factor authentication has been successfully disabled");
      setTimeout(() => {
        router.reload();
      }, 2000);
    } catch (err) {
      console.error("2FA disable error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to verify code. Please make sure you entered it correctly."
      );
    } finally {
      setIsSubmitting(false);
      reset();
    }
  };

  const generateRecoveryCodes = async () => {
    try {
      setError(null);
      setIsSubmitting(true);

      const token = getCookie("token") || localStorage.getItem("auth_token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/recovery-codes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Recovery codes generated:", response.data);
      // Display recovery codes
      setRecoveryCodes(response.data.data.recoveryCodes);
    } catch (err) {
      console.error("Recovery codes generation error:", err);
      setError("Failed to generate recovery codes. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>Two-Factor Authentication - Secure Auth System</title>
      </Head>

      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-primary-600">
                Secure Auth System
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                My Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Two-Factor Authentication
        </h1>

        {error && <div className="alert alert-error mb-6">{error}</div>}
        {success && <div className="alert alert-success mb-6">{success}</div>}

        <div className="bg-white overflow-hidden shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {user.twoFactorEnabled
              ? "Manage Two-Factor Authentication"
              : "Setup Two-Factor Authentication"}
          </h2>

          <p className="text-gray-600 mb-6">
            Two-factor authentication adds an extra layer of security to your
            account. When 2FA is enabled, you'll need to provide a verification
            code from your authenticator app in addition to your password when
            logging in.
          </p>

          {!setupMode && !user.twoFactorEnabled && (
            <button
              onClick={setup2FA}
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting
                ? "Setting up..."
                : "Setup Two-Factor Authentication"}
            </button>
          )}

          {setupMode && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                Scan this QR code with your authenticator app
              </h3>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-white p-4 border border-gray-300 rounded-md inline-block">
                  <img
                    src={qrCode}
                    alt="QR Code for 2FA"
                    className="h-48 w-48"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-4">
                    Scan the QR code with an authenticator app like Google
                    Authenticator, Authy, or Microsoft Authenticator. If you
                    can't scan the QR code, you can manually enter this code:
                  </p>

                  <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all mb-4">
                    {secret}
                  </div>

                  <form onSubmit={handleSubmit(enable2FA)} className="mt-4">
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
                        placeholder="Enter the 6-digit code"
                        {...register("token", {
                          required: "Verification code is required",
                          pattern: {
                            value: /^\d{6}$/,
                            message: "Must be a 6-digit code",
                          },
                        })}
                        className={`form-control ${
                          errors.token ? "is-invalid" : ""
                        }`}
                      />
                      {errors.token && (
                        <span className="error-message">
                          {errors.token.message}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {isSubmitting ? "Verifying..." : "Verify and Enable"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSetupMode(false)}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {user.twoFactorEnabled && (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Two-factor authentication is enabled for your account
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  Disable Two-Factor Authentication
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  If you want to disable two-factor authentication, please enter
                  a verification code from your authenticator app.
                </p>

                <form onSubmit={handleSubmit(disable2FA)} className="mt-4">
                  <div className="form-group">
                    <label
                      htmlFor="disable-token"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Verification Code
                    </label>
                    <input
                      id="disable-token"
                      type="text"
                      placeholder="Enter the 6-digit code"
                      {...register("token", {
                        required: "Verification code is required",
                        pattern: {
                          value: /^\d{6}$/,
                          message: "Must be a 6-digit code",
                        },
                      })}
                      className={`form-control max-w-xs ${
                        errors.token ? "is-invalid" : ""
                      }`}
                    />
                    {errors.token && (
                      <span className="error-message">
                        {errors.token.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {isSubmitting
                      ? "Processing..."
                      : "Disable Two-Factor Authentication"}
                  </button>
                </form>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  Recovery Codes
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  Recovery codes can be used to access your account if you lose
                  your device with the authenticator app. Please store these
                  codes in a secure place. They will only be shown once.
                </p>

                {recoveryCodes ? (
                  <div>
                    <div className="bg-gray-100 p-4 rounded-md mb-4">
                      <h4 className="text-sm font-bold text-red-600 mb-2">
                        Important: These codes will only be shown once!
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {recoveryCodes.map((code, index) => (
                          <div key={index} className="font-mono text-sm">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(recoveryCodes.join("\n"));
                        alert("Recovery codes copied to clipboard");
                      }}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-2"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecoveryCodes(null)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={generateRecoveryCodes}
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {isSubmitting ? "Generating..." : "Generate Recovery Codes"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
