import axios from "axios";
import { setToken } from "../slices/authSlices";
import toast from "react-hot-toast";
import { joinUrl } from "../utils/urlUtils";

// Using environment variable directly for API calls with URL utility to prevent double slashes
const API_URL = joinUrl(import.meta.env.VITE_BACKEND_URL, 'admin/auth');

//login 
export const login = (email, password, navigate) => async (dispatch) => {
  try {
    console.log("Attempting login with:", { email, url: `${API_URL}/login` });
    
    const response = await axios.post(`${API_URL}/login`, { email, password });
    console.log("Login response:", response); // Debugging

    if (response.status === 200) {  // Fix status check
      dispatch(setToken(response.data.token)); 
      localStorage.setItem("token", JSON.stringify(response.data.token));
      navigate("/");
      toast.success("Login Successful");
    } else {
      toast.error(response.data.message || "Login Failed");
    }
  } catch (error) {
    console.error("Login error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 500) {
      toast.error("Server error. Please contact the administrator.");
    } else {
      toast.error(error.response?.data?.message || "Login failed");
    }
  }
};


// Update Password Service
export const updatePassword = async (oldPassword, newPassword, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/updatePassword`,
      { oldPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      toast.success("Password updated successfully!");
      return response.data;
    } else {
      toast.error(response.data.message || "Failed to update password.");
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Error updating password:", error);
    toast.error(error.response?.data?.message || "An error occurred while updating the password.");
    throw error;
  }
};