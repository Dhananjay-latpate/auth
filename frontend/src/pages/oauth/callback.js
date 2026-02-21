import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { storeAuthToken } from "../../utils/tokenUtils";

/**
 * OAuth callback page - handles redirect from OAuth providers.
 * The backend redirects here with a JWT token in the query string.
 * This page stores the token and redirects to the dashboard.
 */
const OAuthCallback = () => {
  const router = useRouter();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    if (!router.isReady) return;

    const { token, error } = router.query;

    if (error) {
      setStatus("Authentication failed. Redirecting to login...");
      setTimeout(() => router.replace("/login?error=oauth_failed"), 2000);
      return;
    }

    if (token) {
      // Basic JWT format validation: three dot-separated base64 segments
      const jwtPattern = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;
      if (!jwtPattern.test(token)) {
        setStatus("Invalid token received. Redirecting to login...");
        setTimeout(() => router.replace("/login?error=invalid_token"), 2000);
        return;
      }
      storeAuthToken(token);
      setStatus("Login successful! Redirecting...");
      router.replace("/dashboard");
    } else {
      setStatus("No token received. Redirecting to login...");
      setTimeout(() => router.replace("/login"), 2000);
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
