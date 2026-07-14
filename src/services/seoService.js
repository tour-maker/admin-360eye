import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: `${API_URL}/admin/seo`, // Update the base URL for SEO
});

// Fetch all SEO entries with pagination
export const fetchSEOs = async (token, search = "", page = 1, limit = 5) => {
  try {
    const response = await api.get("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        search,
        page,
        limit,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    // toast.error("Error fetching SEO entries");
    console.error("Error fetching SEO entries:", error);
    throw error;
  }
};

// Add a new SEO entry
export const createSEO = async (formData, token) => {
  try {
    const response = await api.post("", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // For file uploads
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("SEO entry added successfully");
    return response.data;
  } catch (error) {
    toast.error("Error adding SEO entry");
    console.error("Error adding SEO entry:", error);
    throw error;
  }
};

// Update an SEO entry
export const updateSEO = async (id, formData, token) => {
  try {
    const response = await api.put(`/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // For file uploads
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("SEO entry updated successfully");
    return response.data;
  } catch (error) {
    toast.error("Error updating SEO entry");
    console.error("Error updating SEO entry:", error);
    throw error;
  }
};

// Delete an SEO entry
export const deleteSEO = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("SEO entry deleted successfully");
    return response.data;
  } catch (error) {
    toast.error("Error deleting SEO entry");
    console.error("Error deleting SEO entry:", error);
    throw error;
  }
};