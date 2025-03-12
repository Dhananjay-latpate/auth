import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getCookie } from "cookies-next";
import Layout from "../components/Layout";
import Link from "next/link";
import Head from "next/head";

export default function Profile() {
  const { user, loading, checkUserLoggedIn } = useAuth();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(null);
  const [passwordChangeError, setPasswordChangeError] = useState(null);

  // Form for basic profile info
  const {
    register: registerBasicInfo,
    handleSubmit: handleSubmitBasicInfo,
    formState: { errors: errorsBasicInfo },
    setValue: setBasicInfoValue,
  } = useForm();

  // Form for password change
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    watch,
    reset: resetPasswordForm,
  } = useForm();

  // For password confirmation validation
  const password = watch("newPassword", "");

  useEffect(() => {
    if (user) {
      // Pre-fill the form with user's current data
      setBasicInfoValue("name", user.name || "");
      setBasicInfoValue("email", user.email || "");
    }
  }, [user, setBasicInfoValue]);

  // Update basic profile information
  const updateProfile = async (data) => {
    try {
      setUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(null);

      const token = getCookie("token") || localStorage.getItem("auth_token");

      // Only send data that needs updating
      const updateData = {
        name: data.name,
      };

      // We don't update email in this form to avoid verification issues

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${user._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUpdateSuccess("Profile information updated successfully");

        // Refresh user data
        await checkUserLoggedIn();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(null);
        }, 3000);
      }
    } catch (error) {
      setUpdateError(error.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // Update password
  const updatePassword = async (data) => {
    try {
      setUpdating(true);
      setPasswordChangeError(null);
      setPasswordChangeSuccess(null);

      const token = getCookie("token") || localStorage.getItem("auth_token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/updatepassword`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPasswordChangeSuccess("Password updated successfully");
        resetPasswordForm(); // Clear the form

        // Clear success message after 3 seconds
        setTimeout(() => {
          setPasswordChangeSuccess(null);
        }, 3000);
      }
    } catch (error) {
      setPasswordChangeError(
        error.response?.data?.error || "Failed to update password"
      );
    } finally {
      setUpdating(false);
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
    return null; // Layout will redirect to login
  }

  return (
    <Layout title="My Profile">
      <Head>
        <title>My Profile - Secure Auth System</title>
      </Head>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information Section */}
        <div className="md:col-span-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Profile Information
              </h2>

              {updateSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 mb-4 rounded-md">
                  {updateSuccess}
                </div>
              )}

              {updateError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md">
                  {updateError}
                </div>
              )}

              <form onSubmit={handleSubmitBasicInfo(updateProfile)}>
                <div className="grid grid-cols-1 gap-6">
                  <div className="form-group">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...registerBasicInfo("name", {
                        required: "Name is required",
                        maxLength: {
                          value: 50,
                          message: "Name cannot exceed 50 characters",
                        },
                      })}
                      className={`form-control ${
                        errorsBasicInfo.name ? "is-invalid" : ""
                      }`}
                    />
                    {errorsBasicInfo.name && (
                      <span className="error-message">
                        {errorsBasicInfo.name.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...registerBasicInfo("email")}
                      className="form-control bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed directly for security reasons.
                    </p>
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Role
                    </label>
                    <input
                      id="role"
                      type="text"
                      value={user.role || ""}
                      className="form-control bg-gray-100"
                      disabled
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {updating ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="md:col-span-1">
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">
                Security Settings
              </h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <nav className="space-y-1">
                <Link href="/profile/two-factor">
                  <button className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                    <div className="flex items-center justify-between">
                      <div>Two-Factor Authentication</div>
                      <div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.twoFactorEnabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </button>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="md:col-span-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Change Password
              </h2>

              {passwordChangeSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 mb-4 rounded-md">
                  {passwordChangeSuccess}
                </div>
              )}

              {passwordChangeError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md">
                  {passwordChangeError}
                </div>
              )}

              <form onSubmit={handleSubmitPassword(updatePassword)}>
                <div className="grid grid-cols-1 gap-6">
                  <div className="form-group">
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      {...registerPassword("currentPassword", {
                        required: "Current password is required",
                      })}
                      className={`form-control ${
                        errorsPassword.currentPassword ? "is-invalid" : ""
                      }`}
                    />
                    {errorsPassword.currentPassword && (
                      <span className="error-message">
                        {errorsPassword.currentPassword.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      {...registerPassword("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        pattern: {
                          value:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                          message:
                            "Password must contain uppercase, lowercase, number and special character",
                        },
                      })}
                      className={`form-control ${
                        errorsPassword.newPassword ? "is-invalid" : ""
                      }`}
                    />
                    {errorsPassword.newPassword && (
                      <span className="error-message">
                        {errorsPassword.newPassword.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      {...registerPassword("confirmPassword", {
                        required: "Please confirm your new password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      className={`form-control ${
                        errorsPassword.confirmPassword ? "is-invalid" : ""
                      }`}
                    />
                    {errorsPassword.confirmPassword && (
                      <span className="error-message">
                        {errorsPassword.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {updating ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
