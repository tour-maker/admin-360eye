import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({ baseURL: `${API_URL}/admin/partners` });

export const fetchPartners = async (token) => {
  const response = await api.get("", { headers: { Authorization: `Bearer ${token}` } });
  if (!response.data.success) throw new Error(response.data.message);
  return response.data;
};

export const createPartner = async (formData, token) => {
  try {
    const response = await api.post("", formData, {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Partner added successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error adding partner");
    throw error;
  }
};

export const updatePartner = async (id, formData, token) => {
  try {
    const response = await api.put(`/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Partner updated successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error updating partner");
    throw error;
  }
};

export const deletePartner = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Partner deleted successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error deleting partner");
    throw error;
  }
};
