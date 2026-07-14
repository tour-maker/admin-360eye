import axios from "axios";
import toast from "react-hot-toast";
import { joinUrl } from "../utils/urlUtils";

const API_BASE = joinUrl(import.meta.env.VITE_BACKEND_URL, "admin/allowed-domains");

const createClient = () =>
  axios.create({
    baseURL: API_BASE,
  });

const withAuth = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const api = createClient();

const extractData = (response) => response?.data;

const handleApiError = (error, defaultMessage = "Request failed") => {
  const message =
    error?.response?.data?.message || error?.message || defaultMessage;
  toast.error(message);
  throw error;
};

export const fetchAllowedDomains = async (token, params = {}) => {
  try {
    const response = await api.get("", {
      ...withAuth(token),
      params,
    });
    return extractData(response);
  } catch (error) {
    handleApiError(error, "Failed to load allowed domains");
  }
};

export const createAllowedDomain = async (token, payload) => {
  try {
    const response = await api.post("", payload, withAuth(token));
    toast.success("Allowed domain created successfully");
    return extractData(response);
  } catch (error) {
    handleApiError(error, "Failed to create allowed domain");
  }
};

export const updateAllowedDomain = async (token, domainId, payload) => {
  try {
    const response = await api.put(`/${domainId}`, payload, withAuth(token));
    toast.success("Allowed domain updated successfully");
    return extractData(response);
  } catch (error) {
    handleApiError(error, "Failed to update allowed domain");
  }
};

export const updateAllowedDomainStatus = async (token, domainId, isActive) => {
  try {
    const response = await api.patch(
      `/${domainId}/status`,
      { isActive },
      withAuth(token)
    );
    toast.success(`Domain ${isActive ? "activated" : "deactivated"} successfully`);
    return extractData(response);
  } catch (error) {
    handleApiError(error, "Failed to update domain status");
  }
};

export const deleteAllowedDomain = async (token, domainId) => {
  try {
    const response = await api.delete(`/${domainId}`, withAuth(token));
    toast.success("Allowed domain deleted successfully");
    return extractData(response);
  } catch (error) {
    handleApiError(error, "Failed to delete allowed domain");
  }
};

export const refreshSecurityConfig = async (token) => {
  try {
    const response = await api.post("/refresh", null, withAuth(token));
    toast.success("Security configuration refreshed");
    return extractData(response);
  } catch (error) {
    handleApiError(error, "Failed to refresh security configuration");
  }
};

export const getSecurityConfigPreview = async (token) => {
  try {
    const response = await api.get("/preview", withAuth(token));
    return extractData(response);
  } catch (error) {
    handleApiError(error, "Failed to load security configuration");
  }
};
