import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Link from "next/link";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import axios from "axios";
import Head from "next/head";

export default function Dashboard() {
  const { user, loading, logout: authLogout, checkUserLoggedIn } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  // Add reference to prevent multiple data refresh attempts
  const dataRefreshAttempted = useRef(false);

  // Force a refresh of user data when the component mounts
  useEffect(() => {
    const refreshUserData = async () => {
      // Prevent multiple refresh attempts
      if (dataRefreshAttempted.current) return;
      dataRefreshAttempted.current = true;

      try {
        console.log("Dashboard - Initial render, checking auth state");

        // Avoid multiple redirects
        if (isRedirecting) return;

        // Check if token exists in localStorage or cookie
        const localToken = localStorage.getItem("auth_token");
        const cookieToken = getCookie("token");

        // If no token in either place, redirect immediately
        if (!localToken && !cookieToken) {
          console.log("No authentication tokens found, redirecting to login");
          setIsRedirecting(true);
          window.location.replace("/login"); // Use replace for clean history
          return;
        }

        // Synchronize token between localStorage and cookie if needed
        if (localToken && !cookieToken) {
          console.log("Restoring token from localStorage to cookie");
          setCookie("token", localToken, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
            sameSite: "lax",
          });
        } else if (cookieToken && !localToken) {
          console.log("Restoring token from cookie to localStorage");
          localStorage.setItem("auth_token", cookieToken);
        }

        // Set up axios auth header with the available token
        const effectiveToken = localToken || cookieToken;
        if (effectiveToken && !axios.defaults.headers.common["Authorization"]) {
          console.log("Setting axios default Authorization header");
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${effectiveToken}`;
        }

        // Only make an API call if we don't have user data yet
        if (!user) {
          const userData = await checkUserLoggedIn();

          if (!userData) {
            console.log("No user data returned, checking tokens again");
            // Double check if tokens were cleared during the checkUserLoggedIn process
            // This might happen if the API returns 401 and the auth context clears tokens
            if (!getCookie("token") && !localStorage.getItem("auth_token")) {
              console.log(
                "Tokens were cleared during check, redirecting to login"
              );
              setIsRedirecting(true);
              window.location.replace("/login");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);

        // Handle unauthorized errors
        if (error.response?.status === 401) {
          console.log("401 Unauthorized response, clearing auth data");
          setIsRedirecting(true);

          // Clear all auth data
          deleteCookie("token", { path: "/" });
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          delete axios.defaults.headers.common["Authorization"];

          // Redirect to login
          window.location.replace("/login");
          return;
        }

        // For other errors, just show error message
        setApiError(
          "Failed to load user data. Please try refreshing the page."
        );
      } finally {
        if (!isRedirecting) {
          setInitialLoad(false);
        }
      }
    };

    // Only call refreshUserData if we're not already redirecting
    if (!isRedirecting) {
      refreshUserData();
    }

    // Reset the data refresh flag when the component unmounts
    return () => {
      dataRefreshAttempted.current = false;
    };
  }, [checkUserLoggedIn, isRedirecting, user]);

  // Don't show loading state if we have cached user data
  const showLoading = loading || initialLoad;
  const cachedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user_data") || "null")
      : null;

  // Improved handleLogout function to fix the redirect issue
  const handleLogout = () => {
    // Set redirecting state to prevent multiple attempts
    setIsRedirecting(true);

    try {
      console.log("Starting logout process from dashboard");

      // First clear auth data to ensure clean logout
      deleteCookie("token", { path: "/" });
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      delete axios.defaults.headers.common["Authorization"];

      // Then call the context logout function which will handle redirection
      if (typeof authLogout === "function") {
        authLogout();
      } else {
        // Fallback if context logout is not available
        window.location.replace("/login?logged_out=true");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Ensure we redirect even if there's an error
      window.location.replace("/login?logged_out=true");
    }
  };

  // Show loading state
  if (showLoading && !cachedUser) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <Head>
          <title>Dashboard - Secure Auth System</title>
        </Head>
        <div className="text-lg text-gray-500">Loading user data...</div>
      </div>
    );
  }

  // Show error state
  if (apiError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
        <Head>
          <title>Dashboard - Error</title>
        </Head>
        <button
          onClick={handleLogout}
          className="w-full mt-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded"
        >
          Return to Login
        </button>
      </div>
    );
  }

  // Use cached user data if available while loading
  const displayUser = user || cachedUser;

  // No user data available - improved redirect logic
  if (!displayUser) {
    // Prevent render loop by only triggering the redirect once
    if (!isRedirecting) {
      setIsRedirecting(true);

      // Immediate cleanup and redirect
      setTimeout(() => {
        // Clear any tokens that might be causing issues
        deleteCookie("token", { path: "/" });
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        // Direct navigation to login page with logged_out flag
        window.location.href = "/login?logged_out=true";
      }, 100);
    }

    // Show minimal loading UI while redirecting
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
        <Head>
          <title>Redirecting...</title>
        </Head>
        <div className="text-lg text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  // User is authenticated, render dashboard
  return (
    <Layout title="Dashboard">
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome, {displayUser.name}!
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Your Account Information
        </h2>
        <p className="mb-2">
          <span className="font-medium">Email:</span> {displayUser.email}
        </p>
        <p className="mb-2">
          <span className="font-medium">Role:</span> {displayUser.role}
        </p>
        {displayUser.createdAt && (
          <p className="mb-2">
            <span className="font-medium">Account Created:</span>{" "}
            {new Date(displayUser.createdAt).toLocaleDateString()}
          </p>
        )}

        {displayUser.permissions && displayUser.permissions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">
              Your Permissions:
            </h3>
            <div className="flex flex-wrap gap-2">
              {displayUser.permissions.map((permission) => (
                <span
                  key={permission}
                  className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {displayUser.role &&
        (displayUser.role === "admin" || displayUser.role === "superadmin") && (
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Admin Actions
            </h2>
            <p className="text-gray-600 mb-4">
              You have administrative privileges. You can manage users and
              system settings.
            </p>
            <Link href="/admin">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Go to Admin Dashboard
              </button>
            </Link>
          </div>
        )}
    </Layout>
  );
}
