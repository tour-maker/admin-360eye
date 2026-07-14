import axios from 'axios';
import toast from 'react-hot-toast';
import { joinUrl } from '../utils/urlUtils';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance
const api = axios.create({
  baseURL: API_URL,
});

/**
 * Upload a ZIP file to the server
 * @param {string} token - Authentication token
 * @param {File} file - The ZIP file to upload
 * @param {string} albumId - ID of the album to add images to
 */
export const uploadZipFile = async (token, file, albumId) => {
  // Check if file exists
  if (!file) {
    toast.error('No file selected');
    throw new Error('No file selected');
  }

  // Debug the file details
  console.log('File details:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  const formData = new FormData();
  
  // Use the exact field name expected by the controller
  formData.append('zipFile', file);
  formData.append('albumId', albumId);

  try {
    // Log what we're sending
    console.log('Sending to endpoint:', '/admin/albums/upload-zip');
    console.log('With albumId:', albumId);
    
    const response = await api.post(joinUrl(API_URL, '/admin/albums/upload-zip'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Upload failed');
    }

    toast.success('ZIP file uploaded successfully');
    return response.data;
  } catch (error) {
    console.error('Error uploading ZIP file:', error);

    // More detailed error logging
    // if (error.response) {
    //   console.error('Response data:', error.response.data);
    //   console.error('Response status:', error.response.status);
    //   console.error('Response headers:', error.response.headers);
    // }

   throw error;
  }
};

