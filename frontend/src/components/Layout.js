import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { deleteCookie } from "cookies-next";

export default function Layout({ children, title, requireAuth = true }) {
  const { user, loading, logout, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the page requires auth and we're not loading and there's no user, redirect
    if (requireAuth && !loading && !user) {
      router.push("/login");
    }
  }, [requireAuth, loading, user, router]);

  if (requireAuth && loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  // If auth is required but there's no user, don't render anything
  // Redirection will happen in the useEffect hook
  if (requireAuth && !user) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>
          {title ? `${title} - Secure Auth System` : "Secure Auth System"}
        </title>
      </Head>

      {requireAuth && (
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

                {/* Add Register New Account button for admins */}
                {user &&
                  (user.role === "admin" || user.role === "superadmin") && (
                    <button
                      onClick={() => router.push("/register?new_account=true")}
                      className="px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                    >
                      Register New User
                    </button>
                  )}

                {hasPermission && hasPermission("manage_users") && (
                  <button
                    onClick={() => router.push("/admin/users")}
                    className="px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                  >
                    Manage Users
                  </button>
                )}

                {user &&
                  (user.role === "admin" || user.role === "superadmin") && (
                    <button
                      onClick={() => router.push("/admin/roles")}
                      className="px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                    >
                      Manage Roles
                    </button>
                  )}

                <button
                  onClick={() => router.push("/profile")}
                  className="px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  My Profile
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Logout clicked from Layout");

                    // Create a function for clean logout
                    const performLogout = () => {
                      try {
                        // Clear all authentication tokens first
                        deleteCookie("token", { path: "/" });
                        localStorage.removeItem("auth_token");
                        localStorage.removeItem("user_data");
                        localStorage.removeItem("isLoggingOut");

                        // Remove authorization header
                        delete axios.defaults.headers.common["Authorization"];

                        // Add a timestamp to prevent caching issues
                        const timestamp = Date.now();

                        // Use the logout parameter to indicate explicit logout intent
                        const logoutUrl = `/login?logged_out=true&t=${timestamp}`;

                        console.log("Redirecting to:", logoutUrl);

                        // Replace current location with login page to clear history
                        window.location.replace(logoutUrl);
                      } catch (error) {
                        console.error("Error during logout:", error);
                        // Fallback to context logout in case of error
                        if (typeof logout === "function") {
                          logout();
                        } else {
                          // Last resort fallback
                          window.location.href = "/login?logged_out=true";
                        }
                      }
                    };

                    // Execute the logout function
                    performLogout();
                  }}
                  className="px-3 py-2 rounded text-sm text-red-600 hover:bg-gray-100 focus:outline-none"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div
        className={requireAuth ? "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" : ""}
      >
        {children}
      </div>
    </div>
  );
}
