import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { FaUsers, FaPlus, FaCog } from "react-icons/fa";

const OrganizationsList = () => {
  const { getUserOrganizations, createOrganization } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // New organization form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDesc, setNewOrgDesc] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Fetch user's organizations
  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const response = await getUserOrganizations();
      setOrganizations(response.data || []);
    } catch (err) {
      setError("Failed to load organizations");
      console.error("Error loading organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  // Handle organization creation
  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await createOrganization({
        name: newOrgName,
        description: newOrgDesc,
      });

      if (response.success) {
        // Refresh the list
        await loadOrganizations();

        // Reset form
        setNewOrgName("");
        setNewOrgDesc("");
        setShowNewForm(false);
        setSuccess("Organization created successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create organization");
      setTimeout(() => setError(null), 4000);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading && organizations.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Organizations</h2>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          <FaPlus className="mr-2" />{" "}
          {showNewForm ? "Cancel" : "Create New Organization"}
        </button>
      </div>

      {showNewForm && (
        <div className="mb-8 p-4 border border-gray-200 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium mb-4">Create New Organization</h3>
          <form onSubmit={handleCreateOrg}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter organization name"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                value={newOrgDesc}
                onChange={(e) => setNewOrgDesc(e.target.value)}
                placeholder="Brief description of your organization"
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {formLoading ? "Creating..." : "Create Organization"}
              </button>
            </div>
          </form>
        </div>
      )}

      {organizations.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <FaUsers className="mx-auto text-gray-400 text-5xl mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Organizations Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first organization to collaborate with others.
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus className="inline mr-2" /> Create Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizations.map((org) => (
            <Link
              href={`/organizations/${org.organization._id}`}
              key={org.organization._id}
              className="block bg-white shadow-md border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {org.organization.logo ? (
                      <img
                        src={org.organization.logo}
                        alt={org.organization.name}
                        className="w-12 h-12 rounded-md mr-4 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md mr-4 bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                        {org.organization.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {org.organization.name}
                      </h3>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                        {org.role}
                      </span>
                    </div>
                  </div>
                  {(org.role === "owner" || org.role === "admin") && (
                    <FaCog className="text-gray-400 hover:text-gray-600" />
                  )}
                </div>
                {org.organization.description && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                    {org.organization.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationsList;
