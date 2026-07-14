import axios from "axios";
import toast from "react-hot-toast";
import { joinUrl } from "../utils/urlUtils";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: `${API_URL}/admin/albums`,
});


export const fetchAlbumImages = async (albumId, token) => {
  try {
    console.log(`Fetching images for album ${albumId}`);
    const response = await api.get(`/images/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Album images response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching album images:", error);
    throw error;
  }
};

// Fetch single image details (optional - if needed for your edit functionality)
export const fetchImageDetails = async (imageId, token) => {
  try {
    const response = await api.get(`/images/${imageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching image details:", error);
    throw error;
  }
};

// Update image details (for your edit functionality)
export const updateImage = async (token, imageId, formData) => {
  try {
    // Important: Don't set Content-Type header manually for FormData
    // The browser will automatically set it with the correct boundary
    const response = await api.put(`/images/${imageId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Remove this line ↓
        // "Content-Type": "multipart/form-data", 
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Image updated successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error updating image");
    console.error("Update error details:", error.response?.data || error);
    throw error;
  }
};

// Delete an image (for your delete functionality)
export const deleteImage = async (token, imageId) => {
  try {
    console.log(`deleteImage called with imageId: ${imageId}`);
    
    // Use the correct endpoint structure - should match how other API calls are made
    // Looking at fetchAlbumImages, it uses /images/:albumId, so we should use /image/:imageId
    const url = joinUrl(API_URL, `/admin/albums/images/${imageId}`);
    console.log('Delete URL:', url);
    
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`Delete response for image ${imageId}:`, response.data);
    
    if (response.data && !response.data.success) {
      console.error(`Error in response for image ${imageId}:`, response.data.message);
      throw new Error(response.data.message);
    }

    return response.data || { success: true };
  } catch (error) {
    console.error(`Error details for image ${imageId}:`, error.response ? error.response.data : error.message);
    toast.error(`Failed to delete image: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};

// Delete all images in an album
export const deleteAllAlbumImages = async (token, albumId) => {
  try {
    console.log('Starting deleteAllAlbumImages with albumId:', albumId);
    console.log('Using token:', token ? 'Token exists' : 'No token');
    
    // First, fetch all images in the album
    const albumData = await fetchAlbumImages(albumId, token);
    console.log('Album data received:', albumData);
    
    // Based on the loadAlbumImages function, the images are in albumData.images, not albumData.data
    const images = albumData.images;
    console.log(`Found ${images ? images.length : 0} images to delete`);
    
    if (!images || images.length === 0) {
      console.log('No images found to delete');
      return { success: true, message: "No images to delete" };
    }
    
    // Track success and failures
    let successCount = 0;
    let failureCount = 0;
    
    // Delete each image one by one
    console.log('Starting to delete images one by one...');
    for (const image of images) {
      try {
        console.log(`Attempting to delete image ${image._id}`);
        const result = await deleteImage(token, image._id);
        console.log(`Delete result for image ${image._id}:`, result);
        successCount++;
        console.log(`Successfully deleted image ${image._id}. Success count: ${successCount}`);
      } catch (error) {
        failureCount++;
        console.error(`Failed to delete image ${image._id}:`, error);
      }
    }
    
    const resultMessage = `Deleted ${successCount} images${failureCount > 0 ? `, failed to delete ${failureCount} images` : ''}`;
    console.log('Delete operation complete:', resultMessage);
    
    return {
      success: true,
      message: resultMessage
    };
  } catch (error) {
    console.error("Error deleting all album images:", error);
    throw error;
  }
};

// Fetch all albums with pagination
export const fetchAlbums = async (token) => {
  try {
    const response = await api.get("", {
  
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    console.log(response);
    return response.data;
  } catch (error) {
    // toast.error("Error fetching albums"); // Display error notification using toast
    console.error("Error fetching albums:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Create a new album
export const createAlbum = async (formData, token) => {
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

    toast.success("Album created successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error creating album"); // Display error notification using toast
    console.error("Error creating album:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Update an album
export const updateAlbum = async (id, formData, token) => {
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

    toast.success("Album updated successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error updating album"); // Display error notification using toast
    console.error("Error updating album:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete an album
export const deleteAlbum = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Album deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting album"); // Display error notification using toast
    console.error("Error deleting album:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete album photo
export const deleteAlbumPhoto = async (id, token) => {
  try {
    const response = await api.delete(`/photo/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Album photo deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting album photo"); // Display error notification using toast
    console.error("Error deleting album photo:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};