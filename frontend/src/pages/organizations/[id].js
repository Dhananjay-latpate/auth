import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import OrganizationMembers from "../../components/organizations/OrganizationMembers";
import { FaCog, FaUsers, FaProjectDiagram, FaTrash } from "react-icons/fa";

const OrganizationDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { checkUserLoggedIn, getOrganization } = useAuth();

  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("members");

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  useEffect(() => {
    const loadOrganization = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await getOrganization(id);
        setOrganization(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load organization");
        console.error("Error loading organization:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push("/organizations")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Organizations
          </button>
        </div>
      </Layout>
    );
  }

  if (!organization) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">Organization not found</h2>
          <button
            onClick={() => router.push("/organizations")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Organizations
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center">
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-16 w-16 rounded-lg object-cover mr-4"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mr-4">
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {organization.website}
                </a>
              )}
            </div>
          </div>
          <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded">
            <FaCog className="mr-2" /> Settings
          </button>
        </div>

        {organization.description && (
          <p className="mb-8 text-gray-600 max-w-3xl">
            {organization.description}
          </p>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "members"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("members")}
            >
              <FaUsers className="inline mr-2" />
              Members
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "projects"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("projects")}
            >
              <FaProjectDiagram className="inline mr-2" />
              Projects
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <FaCog className="inline mr-2" />
              Settings
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "members" && (
            <OrganizationMembers organizationId={id} />
          )}

          {activeTab === "projects" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Projects</h2>
              <p className="text-gray-500">
                Project management will be implemented in a future update.
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Organization Settings
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">General Settings</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={organization.name}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={organization.description}
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={organization.website}
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">
                    Danger Zone
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-red-800">
                          Delete Organization
                        </h4>
                        <p className="text-sm text-red-700">
                          Once you delete an organization, there is no going
                          back. Please be certain.
                        </p>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded">
                        <FaTrash className="inline mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrganizationDetailPage;
