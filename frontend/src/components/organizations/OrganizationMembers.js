import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaTrash, FaUserCog } from "react-icons/fa";

const OrganizationMembers = ({ organizationId }) => {
  const { getOrganizationMembers, inviteUserToOrganization } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Invitation form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await getOrganizationMembers(organizationId);
      setMembers(response.data || []);
    } catch (err) {
      setError("Failed to load members");
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    }
  }, [organizationId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);

    try {
      await inviteUserToOrganization(organizationId, {
        email: inviteEmail,
        role: inviteRole,
      });

      // Reset form and fetch updated members
      setInviteEmail("");
      setInviteRole("member");
      setShowInviteForm(false);
      await fetchMembers();

      setSuccess("User invited successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to invite user");
      setTimeout(() => setError(null), 4000);
    } finally {
      setInviting(false);
    }
  };

  if (loading && !members.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
        >
          <FaPlus className="mr-2" />{" "}
          {showInviteForm ? "Cancel" : "Invite User"}
        </button>
      </div>

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

      {showInviteForm && (
        <div className="mb-6 p-4 border border-gray-200 bg-gray-50 rounded">
          <h3 className="text-lg font-medium mb-4">Invite Team Member</h3>
          <form onSubmit={handleInvite}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Admins can invite other users and manage organization settings
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={inviting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                {inviting ? "Inviting..." : "Send Invitation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
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
                Joined
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
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No members found. Invite someone to get started!
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={
                              member.avatar.startsWith("http")
                                ? member.avatar
                                : `/uploads/avatars/${
                                    member.avatar.split("/avatars/")[1] ||
                                    member.avatar
                                  }` // Fix path
                            }
                            alt={member.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === "owner"
                          ? "bg-purple-100 text-purple-800"
                          : member.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {member.role !== "owner" && (
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </button>
                    )}
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

export default OrganizationMembers;
