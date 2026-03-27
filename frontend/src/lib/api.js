import { apiClient } from "./config";

const axiosInstance = apiClient;

// Get Stream Chat token
export const getStreamToken = async () => {
  try {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
  } catch (error) {
    console.error("Error fetching Stream token:", error);
    throw error;
  }
};

// Get current authenticated user
export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/user");
    return response.data;
  } catch (error) {
    console.error("Error fetching auth user:", error);
    return null;
  }
};

// Create a chat channel with a user
export const createChatChannel = async (memberEmail) => {
  try {
    const response = await axiosInstance.post("/chat/channel", {
      memberId: memberEmail,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating chat channel:", error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.post("/auth/update-profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Login
export const login = async (loginData) => {
  try {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export default axiosInstance;
