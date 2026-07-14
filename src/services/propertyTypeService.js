// services/propertyTypeService.js
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: `${API_URL}/admin/propertyTypes`,
});

// Fetch all property types with pagination
export const fetchPropertyTypes = async (token) => {
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
    // toast.error("Error fetching property types"); // Display error notification using toast
    console.error("Error fetching property types:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Create a new property type
export const createPropertyType = async (formData, token) => {
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

    toast.success("Property type created successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error creating property type"); // Display error notification using toast
    console.error("Error creating property type:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Update a property type
export const updatePropertyType = async (id, formData, token) => {
  try {
    const response = await api.put(`/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Property type updated successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error updating property type"); // Display error notification using toast
    console.error("Error updating property type:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete a property type
export const deletePropertyType = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Property type deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting property type"); // Display error notification using toast
    console.error("Error deleting property type:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete property type photo
export const deletePropertyTypePhoto = async (id, token) => {
  try {
    const response = await api.delete(`/photo/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Property type photo deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting property type photo"); // Display error notification using toast
    console.error("Error deleting property type photo:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};