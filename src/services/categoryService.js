import axios from "axios";
import toast from "react-hot-toast";
import { joinUrl } from "../utils/urlUtils";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: joinUrl(API_URL, 'admin/categories'),
});

// Fetch all categories with pagination
export const fetchCategories = async (token) => {
  try {
    const response = await api.get("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    console.log(response);
    return response.data;
  } catch (error) {
    // toast.error("Error fetching categories"); // Display error notification using toast
    console.error("Error fetching categories:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Create a new category
export const createCategory = async (formData, token) => {
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

    toast.success("Category created successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error creating category"); // Display error notification using toast
    console.error("Error creating category:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Update a category
export const updateCategory = async (id, formData, token) => {
  try {
    const response = await api.put(`/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Category updated successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error updating category"); // Display error notification using toast
    console.error("Error updating category:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete a category
export const deleteCategory = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Category deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting category"); // Display error notification using toast
    console.error("Error deleting category:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete category photo
export const deleteCategoryPhoto = async (id, token) => {
  try {
    const response = await api.delete(`/photo/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Category photo deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting category photo"); // Display error notification using toast
    console.error("Error deleting category photo:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};
