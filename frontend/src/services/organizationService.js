import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get organizations the user belongs to
export const getUserOrganizations = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/organizations/me`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    throw error;
  }
};

// Get a single organization by ID
export const getOrganization = async (orgId) => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/organizations/${orgId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching organization:", error);
    throw error;
  }
};

// Create a new organization
export const createOrganization = async (organizationData) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/v1/organizations`,
      organizationData
    );
    return res.data;
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error;
  }
};

// Update an organization
export const updateOrganization = async (orgId, organizationData) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/v1/organizations/${orgId}`,
      organizationData
    );
    return res.data;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
};

// Delete an organization
export const deleteOrganization = async (orgId) => {
  try {
    const res = await axios.delete(`${API_URL}/api/v1/organizations/${orgId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting organization:", error);
    throw error;
  }
};

// Get organization members
export const getOrganizationMembers = async (orgId) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/v1/organizations/${orgId}/members`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching organization members:", error);
    throw error;
  }
};

// Invite a user to the organization
export const inviteUserToOrganization = async (orgId, userData) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/v1/organizations/${orgId}/invite`,
      userData
    );
    return res.data;
  } catch (error) {
    console.error("Error inviting user to organization:", error);
    throw error;
  }
};

// Remove a user from the organization
export const removeUserFromOrganization = async (orgId, userId) => {
  try {
    const res = await axios.delete(
      `${API_URL}/api/v1/organizations/${orgId}/members/${userId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error removing user from organization:", error);
    throw error;
  }
};

// Leave an organization
export const leaveOrganization = async (orgId) => {
  try {
    const res = await axios.delete(
      `${API_URL}/api/v1/organizations/${orgId}/members/me`
    );
    return res.data;
  } catch (error) {
    console.error("Error leaving organization:", error);
    throw error;
  }
};

export default {
  getUserOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  inviteUserToOrganization,
  removeUserFromOrganization,
  leaveOrganization,
};
