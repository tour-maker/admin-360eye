import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/admin/client-access`,
});

export const fetchClientAccessList = async (token) => {
  try {
    const response = await api.get("", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    return response.data.clients;
  } catch (error) {
    console.error("Error fetching client access list:", error);
    throw error;
  }
};

export const fetchClientAccessById = async (id, token) => {
  try {
    const response = await api.get(`/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    return response.data.client;
  } catch (error) {
    console.error("Error fetching client access:", error);
    throw error;
  }
};

export const createClientAccess = async (data, token) => {
  try {
    const response = await api.post("", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Client access link created");
    return response.data.client;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error creating client access");
    console.error("Error creating client access:", error);
    throw error;
  }
};

export const updateClientAccess = async (id, data, token) => {
  try {
    const response = await api.put(`/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Client access updated");
    return response.data.client;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error updating client access");
    console.error("Error updating client access:", error);
    throw error;
  }
};

export const deleteClientAccess = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Client access deleted");
    return response.data;
  } catch (error) {
    toast.error("Error deleting client access");
    console.error("Error deleting client access:", error);
    throw error;
  }
};
