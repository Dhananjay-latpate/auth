import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Alert from "./ui/Alert";
import { formatPageTitle } from "../utils/titleUtils";

const Layout = ({
  children,
  title = "Authentication App",
  requireAuth = false,
  showSidebar = true,
}) => {
  const router = useRouter();
  const { user, loading, checkUserLoggedIn, rateLimited } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [showRateLimitAlert, setShowRateLimitAlert] = useState(false);

  // Only check auth when needed and avoid frequent checks
  useEffect(() => {
    // Create a unique key to track auth check for this particular render
    const checkId = Date.now();

    // Only check auth if the page requires it and we haven't already checked
    const checkAuth = async () => {
      // If user is already loaded and valid, don't check again
      if (user && !requireAuth) {
        setAuthChecked(true);
        return;
      }

      if (requireAuth && !authChecked) {
        try {
          // Show rate limit alert if needed
          if (rateLimited) {
            setShowRateLimitAlert(true);
            setTimeout(() => {
              setShowRateLimitAlert(false);
            }, 5000);
          }

          // First check if we already have user data before making a new request
          if (!user || Object.keys(user).length === 0) {
            // Try to get user data, but we'll accept cached data if rate limited
            const userData = await checkUserLoggedIn();
            setAuthChecked(true);

            // If user data is still unavailable after checking (and not rate limited)
            if (!userData && !loading && !rateLimited && redirectAttempts < 3) {
              console.log("No user data, redirecting to login");
              setRedirectAttempts((prev) => prev + 1);

              if (typeof window !== "undefined") {
                // Add debug flag to help diagnose issues
                window.location.href = `/login?redirect=${encodeURIComponent(
                  router.asPath
                )}&retry=${Date.now()}&debug=1`;
              }
            }
          } else {
            setAuthChecked(true);
          }
        } catch (error) {
          console.error("Error checking auth:", error);
          setAuthChecked(true);
        }
      } else {
        setAuthChecked(true);
      }
    };

    checkAuth();

    // Clean up function to prevent state updates after unmount
    return () => {
      // Nothing to clean up for now
    };
  }, [
    requireAuth,
    router,
    checkUserLoggedIn,
    loading,
    redirectAttempts,
    authChecked,
    rateLimited,
    user,
  ]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Determine if we should show navigation (don't show on login, register, etc.)
  const isAuthPage =
    ["/login", "/register", "/forgot-password"].includes(router.pathname) ||
    router.pathname.startsWith("/reset-password");

  // If we're still checking auth and the page requires auth, show a loading state
  if (requireAuth && loading && !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Customize layout based on page type
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col">
        <Head>
          {/* Fix: Use the formatPageTitle utility to create a single text node */}
          <title>{formatPageTitle(title)}</title>
          <meta name="description" content="Secure authentication system" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md slide-in">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-indigo-600 p-2 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
              <h2 className="mt-3 text-3xl font-bold text-gray-900">{title}</h2>
            </div>
            {children}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        {/* Fix: Use the formatPageTitle utility to create a single text node */}
        <title>{formatPageTitle(title)}</title>
        <meta name="description" content="Secure authentication system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {showSidebar && <Sidebar isOpen={isSidebarOpen} />}
        <main className="flex-grow">{children}</main>
      </div>

      <Footer />

      {showRateLimitAlert && (
        <Alert
          type="warning"
          message="You are being rate limited. Please try again later."
        />
      )}
    </div>
  );
};

export default Layout;
