import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/admin/email-settings`,
});

const buildAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const fetchEmailSettings = async (token) => {
  try {
    if (!token) {
      toast.error("Authentication required");
      throw new Error("Authentication token is missing");
    }

    const response = await api.get("", {
      headers: buildAuthHeaders(token),
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load email settings");
    }

    return response.data.settings;
  } catch (error) {
    console.error("Error fetching email settings:", error);
    toast.error(error.response?.data?.message || "Failed to load email settings");
    throw error;
  }
};

export const saveEmailSettings = async (payload, token) => {
  try {
    if (!token) {
      toast.error("Authentication required");
      throw new Error("Authentication token is missing");
    }

    const response = await api.post("", payload, {
      headers: buildAuthHeaders(token),
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update email settings");
    }

    toast.success(response.data.message || "Email settings updated successfully");
    return response.data.settings;
  } catch (error) {
    console.error("Error updating email settings:", error);
    toast.error(error.response?.data?.message || "Failed to update email settings");
    throw error;
  }
};
