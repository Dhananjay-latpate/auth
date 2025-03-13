import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaKey, FaPlus, FaCopy, FaTrash } from "react-icons/fa";

const ApiKeyManager = () => {
  const { getUserApiKeys, generateApiKey, revokeApiKey } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newKeyVisible, setNewKeyVisible] = useState(false);
  const [keyCreated, setKeyCreated] = useState(null);

  // Form state for new API key
  const [keyForm, setKeyForm] = useState({
    name: "",
    permissions: ["read"],
    expiryDays: 365,
  });

  // Load all API keys on component mount
  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await getUserApiKeys();
      setApiKeys(response.data || []);
    } catch (err) {
      setError("Failed to load API keys");
      console.error("Error loading API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setKeyForm({ ...keyForm, [name]: value });
  };

  // Handle permission toggles
  const handlePermissionChange = (permission) => {
    const currentPermissions = [...keyForm.permissions];
    if (currentPermissions.includes(permission)) {
      // Remove the permission
      setKeyForm({
        ...keyForm,
        permissions: currentPermissions.filter((p) => p !== permission),
      });
    } else {
      // Add the permission
      setKeyForm({
        ...keyForm,
        permissions: [...currentPermissions, permission],
      });
    }
  };

  // Create a new API key
  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      const response = await generateApiKey(keyForm);

      if (response.success) {
        // Store the key temporarily to show to user
        setKeyCreated(response.data);

        // Reset form
        setKeyForm({
          name: "",
          permissions: ["read"],
          expiryDays: 365,
        });

        // Refresh the key list
        fetchApiKeys();

        setSuccess("API key generated successfully");
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate API key");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Revoke an API key
  const handleRevokeKey = async (keyId, keyName) => {
    if (
      !confirm(
        `Are you sure you want to revoke the API key "${keyName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await revokeApiKey(keyId);

      // Update the local state instead of refetching all keys
      setApiKeys(apiKeys.filter((key) => key._id !== keyId));

      setSuccess("API key revoked successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to revoke API key");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSuccess("API key copied to clipboard");
        setTimeout(() => setSuccess(null), 2000);
      })
      .catch(() => {
        setError("Failed to copy API key");
        setTimeout(() => setError(null), 2000);
      });
  };

  // Format expiry date
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format creation date
  const formatCreationDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && !apiKeys.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">API Keys</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Show newly created API key */}
      {keyCreated && (
        <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Your API Key Has Been Created
          </h3>
          <p className="text-yellow-700 mb-2">
            Copy this key now. You won't be able to see it again!
          </p>
          <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded">
            <code className="text-sm break-all flex-1">{keyCreated.key}</code>
            <button
              onClick={() => copyToClipboard(keyCreated.key)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FaCopy />
            </button>
          </div>
          <button
            onClick={() => setKeyCreated(null)}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toggle create key form */}
      {!newKeyVisible ? (
        <div className="mb-6">
          <button
            onClick={() => setNewKeyVisible(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            <FaPlus className="mr-2" /> Create New API Key
          </button>
        </div>
      ) : (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-medium mb-4">Create New API Key</h3>
          <form onSubmit={handleCreateKey}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Key Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={keyForm.name}
                onChange={handleChange}
                placeholder="e.g. Development API Key"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Permissions
              </label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-read"
                    checked={keyForm.permissions.includes("read")}
                    onChange={() => handlePermissionChange("read")}
                    className="mr-2"
                  />
                  <label htmlFor="perm-read">Read</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-write"
                    checked={keyForm.permissions.includes("write")}
                    onChange={() => handlePermissionChange("write")}
                    className="mr-2"
                  />
                  <label htmlFor="perm-write">Write</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-delete"
                    checked={keyForm.permissions.includes("delete")}
                    onChange={() => handlePermissionChange("delete")}
                    className="mr-2"
                  />
                  <label htmlFor="perm-delete">Delete</label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="expiryDays"
              >
                Expires After (days)
              </label>
              <select
                id="expiryDays"
                name="expiryDays"
                value={keyForm.expiryDays}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="730">2 years</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setNewKeyVisible(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create API Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Keys list */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  You don't have any API keys yet
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key._id}>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaKey className="text-gray-500 mr-2" />
                      <div className="font-medium text-gray-900">
                        {key.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((perm) => (
                        <span
                          key={perm}
                          className={`px-2 py-1 text-xs font-semibold rounded-full 
                            ${
                              perm === "read"
                                ? "bg-blue-100 text-blue-800"
                                : perm === "write"
                                ? "bg-green-100 text-green-800"
                                : perm === "delete"
                                ? "bg-red-100 text-red-800"
                                : perm === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                    {formatCreationDate(key.createdAt)}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                    {formatExpiryDate(key.expiresAt)}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleRevokeKey(key._id, key.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <div className="flex items-center">
                        <FaTrash className="mr-1" /> Revoke
                      </div>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiKeyManager;
