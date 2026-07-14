

// src/services/redirectService.js
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const API_URL = `${API_BASE_URL}/admin/page-redirects`;

// Fetch all redirects with pagination and search
export const fetchRedirects = async (token, search = '', page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}`, {
      params: { search, page, limit },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add a new redirect
export const addRedirect = async (redirectData, token) => {
  try {
    const response = await axios.post(`${API_URL}`, redirectData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update an existing redirect
export const updateRedirect = async (id, redirectData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, redirectData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a redirect
export const deleteRedirect = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};