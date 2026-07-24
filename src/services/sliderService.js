import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: `${API_URL}/admin/sliders`, // Update the base URL for sliders
});

// Fetch all sliders 
export const fetchSliders = async (token, search = "") => {
  try {
    const response = await api.get("", {
      params: {
        search,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching sliders:", error);
    throw error;
  }
};

// Add a new slider
export const addSlider = async (formData, token) => {
  try {
    const response = await api.post("", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // For file uploads
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Slider added successfully");
    return response.data;
  } catch (error) {
    toast.error("Error adding slider");
    console.error("Error adding slider:", error);
    throw error;
  }
};

// Update a slider
export const updateSlider = async (id, formData, token) => {
  try {
    const response = await api.put(`/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // For file uploads
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Slider updated successfully");
    return response.data;
  } catch (error) {
    toast.error("Error updating slider");
    console.error("Error updating slider:", error);
    throw error;
  }
};

// Delete a slider
export const deleteSlider = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Slider deleted successfully");
    return response.data;
  } catch (error) {
    toast.error("Error deleting slider");
    console.error("Error deleting slider:", error);
    throw error;
  }
};

// Update slider order
export const updateSliderOrder = async (id, newOrder, token) => {
  try {
    const response = await api.patch(`/${id}/order`, 
      { sliderOrder: newOrder },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error updating slider order:", error);
    throw error;
  }
};