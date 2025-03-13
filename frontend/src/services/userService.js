import axios from "axios";
import { setupAxiosDefaults } from "../utils/axiosUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get user profile data
export const getUserProfile = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/auth/profile`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update user profile data
export const updateUserProfile = async (profileData) => {
  try {
    const res = await axios.put(`${API_URL}/api/v1/auth/profile`, profileData);
    return res.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Update user avatar - Fixed to ensure FormData is not empty
export const updateUserAvatar = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("avatar", imageFile);

    console.log("Uploading file:", imageFile.name, "size:", imageFile.size);

    // Log the FormData content for debugging
    for (let [key, value] of formData.entries()) {
      console.log(
        `FormData contains: ${key}: ${
          value instanceof File ? value.name : value
        }`
      );
    }

    const res = await axios.post(
      `${API_URL}/api/v1/auth/profile/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (preferences) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/v1/auth/profile/preferences`,
      preferences
    );
    return res.data;
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  updateUserPreferences,
};
