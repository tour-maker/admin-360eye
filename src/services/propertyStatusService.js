import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: `${API_URL}/admin/propertyStatus`,
});

// Fetch all property statuses with pagination
export const fetchPropertyStatuses = async (token) => {
  try {
    const response = await api.get("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    console.log(response);
    return response.data;
  } catch (error) {
    // toast.error("Error fetching property statuses"); // Display error notification using toast
    console.error("Error fetching property statuses:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Create a new property status
export const createPropertyStatus = async (formData, token) => {
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

    toast.success("Property status created successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error creating property status"); // Display error notification using toast
    console.error("Error creating property status:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Update a property status
export const updatePropertyStatus = async (id, formData, token) => {
  try {
    const response = await api.put(`/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Property status updated successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error updating property status"); // Display error notification using toast
    console.error("Error updating property status:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete a property status
export const deletePropertyStatus = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Property status deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting property status"); // Display error notification using toast
    console.error("Error deleting property status:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete property status photo
export const deletePropertyStatusPhoto = async (id, token) => {
  try {
    const response = await api.delete(`/photo/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Property status photo deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting property status photo"); // Display error notification using toast
    console.error("Error deleting property status photo:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};