import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import axios from "axios";

const Profile = () => {
  const { user, checkUserLoggedIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile`,
        { name }
      );

      if (response.data.success) {
        setSuccess("Profile updated successfully");
        setIsEditing(false);
        // Refresh user data
        await checkUserLoggedIn();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="My Profile" requireAuth={true}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              title="Profile Information"
              subtitle="Update your account information"
            >
              {success && <Alert type="success" message={success} />}
              {error && <Alert type="error" message={error} />}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    ) : (
                      <div className="mt-1 py-2 px-3 bg-gray-50 rounded-md">
                        {user?.name || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <div className="mt-1 py-2 px-3 bg-gray-50 rounded-md">
                      {user?.email || "Loading..."}
                      {isEditing && (
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed directly. Contact support if
                          you need to update your email.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Account Created</label>
                    <div className="mt-1 py-2 px-3 bg-gray-50 rounded-md">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Loading..."}
                    </div>
                  </div>

                  <div className="pt-4">
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isSubmitting}
                          disabled={!name.trim()}
                        >
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setIsEditing(false);
                            setName(user?.name || "");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Card>
          </div>

          <div>
            <Card title="Account Details">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Role</h4>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {user?.role || "Loading..."}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Security Status
                  </h4>
                  <div className="mt-1 flex items-center">
                    {user?.twoFactorEnabled ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-900">
                          Enhanced security (2FA enabled)
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm text-gray-900">
                          Basic security (2FA disabled)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Last Login
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "No recent login recorded"}
                  </p>
                  {user?.lastLoginIP && (
                    <p className="mt-1 text-xs text-gray-500">
                      IP: {user.lastLoginIP}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    href="/settings/security"
                    variant="primary"
                    className="w-full"
                  >
                    Security Settings
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
