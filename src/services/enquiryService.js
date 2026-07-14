import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: `${API_URL}/admin/enquiries`,
});

// Submit an enquiry
export const submitEnquiry = async (formData) => {
  try {
    const response = await api.post("/", formData);
    toast.success("Enquiry submitted successfully");
    return response.data;
  } catch (error) {
    // toast.error("Error submitting enquiry");
    console.error("Error submitting enquiry:", error);
    throw error;
  }
};

// Fetch all enquiries
export const fetchEnquiries = async (token) => {
  try {
    const response = await api.get("/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // toast.error("Error fetching enquiries");
    console.error("Error fetching enquiries:", error);
    throw error;
  }
};

// Delete an enquiry
export const deleteEnquiry = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success("Enquiry deleted successfully");
    return response.data;
  } catch (error) {
    // toast.error("Error deleting enquiry");
    console.error("Error deleting enquiry:", error);
    throw error;
  }
};