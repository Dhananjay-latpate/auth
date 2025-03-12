import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../../components/Layout";

const TwoFactorSettingsPage = () => {
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isDisableMode, setIsDisableMode] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const { user, setup2FA, enable2FA, disable2FA, generateRecoveryCodes } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    // Reset state when user changes
    if (user) {
      setIsSetupMode(false);
      setIsDisableMode(false);
      setQrCode("");
      setSecret("");
      setVerificationCode("");
      setRecoveryCodes([]);
      setShowRecoveryCodes(false);
      setStatusMessage("");
      setError("");
    }
  }, [user]);

  // Initialize 2FA setup
  const handleSetup2FA = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const response = await setup2FA();

      if (response.success) {
        setQrCode(response.data.qrCode); // This should now contain the full data URL
        setSecret(response.data.secret);
        setIsSetupMode(true);
      }
    } catch (error) {
      setError("Failed to initialize 2FA setup. Please try again.");
      console.error("2FA setup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enable 2FA after verification
  const handleEnable2FA = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await enable2FA(verificationCode);

      if (response.success) {
        // Generate recovery codes after enabling 2FA
        const recoveryResponse = await generateRecoveryCodes();
        if (recoveryResponse.success) {
          setRecoveryCodes(recoveryResponse.data.recoveryCodes);
          setShowRecoveryCodes(true);
        }
        setIsSetupMode(false);
        setStatusMessage(
          "Two-factor authentication has been enabled successfully"
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Invalid verification code. Please try again."
      );
      console.error("2FA enable error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await disable2FA(verificationCode);

      if (response.success) {
        setIsDisableMode(false);
        setStatusMessage(
          "Two-factor authentication has been disabled successfully"
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Invalid verification code. Please try again."
      );
      console.error("2FA disable error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate new recovery codes
  const handleGenerateRecoveryCodes = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const response = await generateRecoveryCodes();

      if (response.success) {
        setRecoveryCodes(response.data.recoveryCodes);
        setShowRecoveryCodes(true);
        setStatusMessage("New recovery codes have been generated");
      }
    } catch (error) {
      setError("Failed to generate recovery codes. Please try again.");
      console.error("Generate recovery codes error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Two-Factor Authentication" requireAuth={true}>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Enhance your account security by requiring a second verification
              step when signing in.
            </p>
          </div>

          {statusMessage && (
            <div className="rounded-md bg-green-50 p-4 mx-6 my-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {statusMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 mx-6 my-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {user?.twoFactorEnabled ? (
              <div>
                <div className="bg-green-50 px-4 py-3 sm:px-6 rounded-md mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Two-factor authentication is currently enabled
                      </p>
                    </div>
                  </div>
                </div>

                {showRecoveryCodes ? (
                  <div className="mb-8">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Your recovery codes
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Save these recovery codes in a secure location. Each code
                      can be used once to regain access to your account if you
                      lose your authenticator device.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md font-mono text-sm mb-4">
                      {recoveryCodes.map((code, index) => (
                        <div key={index} className="mb-1">
                          {code}
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <button
                        type="button"
                        className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setShowRecoveryCodes(false)}
                      >
                        Hide codes
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            recoveryCodes.join("\n")
                          );
                          setStatusMessage(
                            "Recovery codes copied to clipboard"
                          );
                          setTimeout(() => setStatusMessage(""), 3000);
                        }}
                      >
                        Copy to clipboard
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={handleGenerateRecoveryCodes}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Generating..."
                        : "Generate new recovery codes"}
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      This will invalidate your previous recovery codes.
                    </p>
                  </div>
                )}

                {isDisableMode ? (
                  <form onSubmit={handleDisable2FA}>
                    <div className="mb-4">
                      <label
                        htmlFor="token"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="token"
                        name="token"
                        autoComplete="off"
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-64 shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(
                            e.target.value.replace(/\D/g, "").substring(0, 6)
                          )
                        }
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Enter the verification code from your authenticator app
                      </p>
                    </div>
                    <div className="flex">
                      <button
                        type="submit"
                        className="mr-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        disabled={isSubmitting || verificationCode.length !== 6}
                      >
                        {isSubmitting ? "Disabling..." : "Confirm Disable"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          setIsDisableMode(false);
                          setVerificationCode("");
                          setError("");
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => {
                      setIsDisableMode(true);
                      setVerificationCode("");
                      setError("");
                      setShowRecoveryCodes(false);
                    }}
                  >
                    Disable two-factor authentication
                  </button>
                )}
              </div>
            ) : isSetupMode ? (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Set up two-factor authentication
                </h4>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    1. Scan the QR code below with your authenticator app (like
                    Google Authenticator, Authy, or 1Password).
                  </p>
                  {qrCode && (
                    <div className="mb-4">
                      <img
                        src={qrCode} // Use the full data URL directly, no need for base64 prefix
                        alt="QR Code for two-factor authentication"
                        className="border border-gray-300 p-2 rounded-md"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    2. If you can't scan the QR code, you can manually add this
                    key to your authenticator app:
                  </p>
                  {secret && (
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {secret}
                      </code>
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-500 text-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          setStatusMessage("Secret key copied to clipboard");
                          setTimeout(() => setStatusMessage(""), 3000);
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-4 mb-2">
                    3. Enter the 6-digit verification code from your
                    authenticator app to verify:
                  </p>
                </div>
                <form onSubmit={handleEnable2FA}>
                  <div className="mb-4">
                    <label
                      htmlFor="token"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="token"
                      name="token"
                      autoComplete="off"
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-64 shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value.replace(/\D/g, "").substring(0, 6)
                        )
                      }
                      maxLength={6}
                    />
                  </div>
                  <div className="flex">
                    <button
                      type="submit"
                      className="mr-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isSubmitting || verificationCode.length !== 6}
                    >
                      {isSubmitting ? "Verifying..." : "Verify and enable"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        setIsSetupMode(false);
                        setVerificationCode("");
                        setError("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div className="bg-yellow-50 px-4 py-3 sm:px-6 rounded-md mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">
                        Two-factor authentication is not enabled for your
                        account
                      </p>
                      <p className="mt-2 text-sm text-yellow-700">
                        Adding a second layer of authentication significantly
                        improves your account security.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleSetup2FA}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Setting up..."
                    : "Set up two-factor authentication"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TwoFactorSettingsPage;
