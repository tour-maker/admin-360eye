import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: `${API_URL}/admin/images`, // Adjust the base URL for images
});

// Create a new image entry
export const createImage = async (formData, token) => {
  try {
    const response = await api.post("", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Image added successfully"); // Display success notification using toast
    return response.data;
  } catch (error) {
    toast.error("Error adding image"); // Display error notification using toast
    console.error("Error adding image:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};