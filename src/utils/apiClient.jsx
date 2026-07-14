import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Load from .env
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Ensures cookies & auth headers are sent
});

export default apiClient;
