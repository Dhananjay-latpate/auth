import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Alert from "./ui/Alert";

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
    <Card className="max-w-md mx-auto slide-in" bodyClassName="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
        <p className="mt-2 text-center text-xs text-gray-500">
          Email: {twoFactorEmail || "Loading..."}
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {!showRecovery ? (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token" className="form-label">
              Verification Code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              autoComplete="off"
              required
              className="form-input text-center text-2xl tracking-widest"
              placeholder="000000"
              value={token}
              onChange={(e) =>
                setToken(e.target.value.replace(/\D/g, "").substring(0, 6))
              }
              maxLength={6}
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              disabled={token.length !== 6}
            >
              Verify
            </Button>
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
        <form className="space-y-6" onSubmit={handleRecoverySubmit}>
          <div>
            <label htmlFor="recoveryCode" className="form-label">
              Recovery Code
            </label>
            <input
              id="recoveryCode"
              name="recoveryCode"
              type="text"
              autoComplete="off"
              required
              className="form-input text-center tracking-wide"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter one of your recovery codes exactly as it appears, including
              dashes
            </p>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              disabled={!recoveryCode.trim()}
            >
              Use Recovery Code
            </Button>
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
    </Card>
  );
};

export default TwoFactorAuthentication;
