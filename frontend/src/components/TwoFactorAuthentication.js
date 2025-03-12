import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const TwoFactorAuthentication = () => {
  const [token, setToken] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyTwoFactor, verifyRecoveryCode, twoFactorEmail, error } =
    useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await verifyTwoFactor(token);
    } catch (error) {
      console.error("2FA verification failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await verifyRecoveryCode(recoveryCode);
    } catch (error) {
      console.error("Recovery code verification failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app to continue.
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            Email: {twoFactorEmail || "Loading..."}
          </p>
        </div>

        {!showRecovery ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="token" className="sr-only">
                  6-digit code
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  autoComplete="off"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter your 6-digit code"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, "").substring(0, 6))
                  }
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting || token.length !== 6}
                className={`group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                ${
                  isSubmitting || token.length !== 6
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </button>
            </div>

            <div className="text-sm text-center">
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => setShowRecovery(true)}
              >
                Use recovery code instead
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRecoverySubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="recoveryCode" className="sr-only">
                  Recovery code
                </label>
                <input
                  id="recoveryCode"
                  name="recoveryCode"
                  type="text"
                  autoComplete="off"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter recovery code"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !recoveryCode.trim()}
                className={`group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                ${
                  isSubmitting || !recoveryCode.trim()
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? "Verifying..." : "Use Recovery Code"}
              </button>
            </div>

            <div className="text-sm text-center">
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => setShowRecovery(false)}
              >
                Use authenticator code instead
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthentication;
