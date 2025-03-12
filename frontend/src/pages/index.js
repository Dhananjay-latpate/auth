import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Head from "next/head";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Secure Authentication System</title>
        <meta
          name="description"
          content="A secure authentication system with role-based access control and two-factor authentication"
        />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary-600">
                Secure Auth System
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <span className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer">
                  Log in
                </span>
              </Link>
              <Link href="/register">
                <span className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 cursor-pointer">
                  Sign up
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Secure Authentication</span>
              <span className="block text-primary-600">Made Simple</span>
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              A comprehensive authentication system with role-based access
              control and two-factor authentication
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link href="/register">
                  <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 cursor-pointer">
                    Get started
                  </span>
                </Link>
              </div>
              <div className="ml-3 rounded-md shadow">
                <Link href="/login">
                  <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 cursor-pointer">
                    Sign in
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for secure authentication
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-lg font-medium text-gray-900 mb-3">
                  Two-Factor Authentication
                </div>
                <p className="text-gray-500">
                  Enhance security with time-based one-time passwords (TOTP)
                  compatible with popular authenticator apps.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-lg font-medium text-gray-900 mb-3">
                  Role-Based Access Control
                </div>
                <p className="text-gray-500">
                  Manage permissions with customizable roles to control exactly
                  what each user can access.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-lg font-medium text-gray-900 mb-3">
                  Secure Password Management
                </div>
                <p className="text-gray-500">
                  Reset passwords securely, with email verification and robust
                  password policies.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-lg font-medium text-gray-900 mb-3">
                  User Management
                </div>
                <p className="text-gray-500">
                  Comprehensive admin dashboard for managing users, roles, and
                  permissions.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-lg font-medium text-gray-900 mb-3">
                  Recovery Codes
                </div>
                <p className="text-gray-500">
                  Backup access with one-time recovery codes if you lose access
                  to your authenticator device.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-lg font-medium text-gray-900 mb-3">
                  Secure API
                </div>
                <p className="text-gray-500">
                  Built with JWT authentication, HTTPS, protection against XSS
                  and CSRF attacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Secure Auth System. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
