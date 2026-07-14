import axios from "axios";
import toast from "react-hot-toast";


const API_URL = import.meta.env.VITE_BACKEND_URL;


const api = axios.create({
  baseURL: `${API_URL}/admin/area`,
});

// Create a new area
export const createArea = async (data, token) => {
  try {

    const response = await api.post("", data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.success) throw new Error(response.data.message);

    toast.success("Area created successfully");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Error creating area";
    toast.error(errorMessage);
    console.error(errorMessage);
    throw error;
  }
};

export const fetchAreas = async (token) => {
  try {
    
    const response = await api.get("", {
      headers: { Authorization: `Bearer ${token}` },
    });

    
    
    if (!response.data || !Array.isArray(response.data.areas)) {
      throw new Error("Invalid response format");
    }

    return response.data.areas || []; // Always return an array
  } catch (error) {
    console.error("Error fetching areas:", error);
    return []; // Return an empty array instead of failing
  }
};



// Update an existing area
export const updateArea = async (id, data, token) => {
  try {
    const response = await api.put(`/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.success) throw new Error(response.data.message);

    toast.success("Area updated successfully");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Error updating area";
    toast.error(errorMessage);
    console.error(errorMessage);
    throw error;
  }
};

// Delete an area
export const deleteArea = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.success) throw new Error(response.data.message);

    toast.success("Area deleted successfully");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Error deleting area";
    toast.error(errorMessage);
    console.error(errorMessage);
    throw error;
  }
};
