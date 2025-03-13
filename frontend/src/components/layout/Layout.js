import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import DashboardSidebar from "./DashboardSidebar";

const Layout = ({ children, title = "Auth Platform" }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Try to access auth context, return minimal layout if not available yet
  let authData;
  try {
    authData = useAuth();
  } catch (error) {
    console.error("Auth context not available yet:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { user, loading } = authData;

  // Handle component mounting for client-side only features
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on the server side
  if (!mounted) {
    return null;
  }

  // Check if the current page is a public page (login, register, etc.)
  const isPublicPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].includes(router.pathname);

  // If loading, show minimal layout with loading spinner
  if (loading && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // For public pages, or when not authenticated, use a simple layout
  if (isPublicPage || !user) {
    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content="Secure authentication platform" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <main>{children}</main>
        </div>
      </>
    );
  }

  // For authenticated users on protected pages, use the dashboard layout
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Secure authentication platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen bg-gray-100">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </>
  );
};

export default Layout;
