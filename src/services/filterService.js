import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/admin/filters`,
});

export const fetchFilters = async (token) => {
  try {
    const response = await api.get("", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching filters:", error);
    throw error;
  }
};

export const createFilter = async (data, token) => {
  try {
    const response = await api.post("", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Filter created successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error creating filter");
    console.error("Error creating filter:", error);
    throw error;
  }
};

export const updateFilter = async (id, data, token) => {
  try {
    const response = await api.put(`/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Filter updated successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error updating filter");
    console.error("Error updating filter:", error);
    throw error;
  }
};

export const deleteFilter = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Filter deleted successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error deleting filter");
    console.error("Error deleting filter:", error);
    throw error;
  }
};
