import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({ baseURL: `${API_URL}/admin/legacy-filters` });

export const fetchLegacyFilterConfigs = async (token) => {
  const response = await api.get("", { headers: { Authorization: `Bearer ${token}` } });
  if (!response.data.success) throw new Error(response.data.message);
  return response.data;
};

export const upsertLegacyFilterConfig = async (key, data, token) => {
  const response = await api.put(`/${key}`, data, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.data.success) throw new Error(response.data.message);
  return response.data;
};
