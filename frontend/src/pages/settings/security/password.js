import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../../components/Layout";

const PasswordChangePage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { updatePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await updatePassword(currentPassword, newPassword);

      if (result.success) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Failed to update password. Please try again."
      );
      console.error("Update password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Change Password" requireAuth={true}>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Change Password
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Update your account password
            </p>
          </div>

          {success && (
            <div className="rounded-md bg-green-50 p-4 mx-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Your password has been updated successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 mx-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters and include uppercase,
                  lowercase, number, and special character
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  ${
                    isSubmitting ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PasswordChangePage;
