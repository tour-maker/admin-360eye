import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: `${API_URL}/admin/360-products`,
});

// Fetch all 360 products with pagination and filtering
export const fetch360Products = async (token, filters = {}) => {
  try {
    const response = await api.get("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filters, // Pass filters as query parameters
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    console.log(response);
    return response.data;
  } catch (error) {
    // toast.error("Error fetching 360 products"); // Display error notification using toast
    console.error("Error fetching 360 products:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Create a new 360 product with image upload
export const create360Product = async (formData, token) => {
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

    toast.success("360 Product created successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error creating 360 product"); // Display error notification using toast
    console.error("Error creating 360 product:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Update a 360 product
export const update360Product = async (id, formData, token) => {
  try {
    const response = await api.put(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("360 Product updated successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error updating 360 product"); // Display error notification using toast
    console.error("Error updating 360 product:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete a 360 product
export const delete360Product = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("360 Product deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting 360 product"); // Display error notification using toast
    console.error("Error deleting 360 product:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete 360 product thumbnail image
export const delete360ProductThumbnail = async (id, token) => {
  try {
    const response = await api.delete(`/photo/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("360 Product thumbnail deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting 360 product thumbnail"); // Display error notification using toast
    console.error("Error deleting 360 product thumbnail:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};