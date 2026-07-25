import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
  baseURL: `${API_URL}/admin/careers`,
});

export const fetchRoles = async (token) => {
  try {
    const response = await api.get("/roles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

export const createRole = async (data, token) => {
  try {
    const response = await api.post("/roles", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Role created successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error creating role");
    throw error;
  }
};

export const updateRole = async (id, data, token) => {
  try {
    const response = await api.put(`/roles/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Role updated successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error updating role");
    throw error;
  }
};

export const deleteRole = async (id, token) => {
  try {
    const response = await api.delete(`/roles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Role deleted successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error deleting role");
    throw error;
  }
};

export const fetchCareerSettings = async (token) => {
  try {
    const response = await api.get("/settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error fetching career settings:", error);
    throw error;
  }
};

export const updateCareerSettings = async (data, token) => {
  try {
    const response = await api.put("/settings", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Settings updated successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error updating settings");
    throw error;
  }
};
