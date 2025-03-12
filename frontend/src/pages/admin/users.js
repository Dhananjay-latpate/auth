import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { getCookie } from "cookies-next";
import Layout from "../../components/Layout";

export default function ManageUsers() {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (
      user &&
      (hasPermission("manage_users") ||
        user.role === "admin" ||
        user.role === "superadmin")
    ) {
      fetchUsers();
    }
  }, [user, hasPermission]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data.data);
      setFetchError(null);
    } catch (error) {
      setFetchError("Failed to load users");
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = getCookie("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActionSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setActionSuccess(null), 3000);

      // Update the users list
      fetchUsers();
    } catch (error) {
      setActionError(
        error.response?.data?.error || "Failed to update user role"
      );
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = getCookie("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActionSuccess("User deleted successfully");
      setTimeout(() => setActionSuccess(null), 3000);

      // Update the users list
      fetchUsers();
    } catch (error) {
      setActionError(error.response?.data?.error || "Failed to delete user");
      setTimeout(() => setActionError(null), 5000);
    }
  };

  return (
    <Layout title="Manage Users">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Manage Users
      </h1>

      {fetchError && <div className="alert alert-error">{fetchError}</div>}
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {actionSuccess && (
        <div className="alert alert-success">{actionSuccess}</div>
      )}

      {loadingUsers ? (
        <div className="py-12 flex justify-center">
          <div className="text-lg text-gray-500">Loading users...</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userItem.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {userItem.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {userItem.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          userItem.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userItem.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.role === "superadmin" ||
                        (user.role === "admin" &&
                          userItem.role !== "superadmin") ? (
                          <>
                            <select
                              defaultValue={userItem.role}
                              onChange={(e) =>
                                updateUserRole(userItem._id, e.target.value)
                              }
                              disabled={
                                user._id === userItem._id ||
                                (user.role === "admin" &&
                                  userItem.role === "admin")
                              }
                              className="block w-32 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              {user.role === "superadmin" && (
                                <option value="superadmin">Super Admin</option>
                              )}
                            </select>

                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onClick={() => deleteUser(userItem._id)}
                              disabled={user._id === userItem._id}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No permission
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
