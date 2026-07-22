import axios from "axios";
 
const API_URL = import.meta.env.VITE_BACKEND_URL;
 
export const getAllBlogs = async (token, search = "") => {
  const res = await axios.get(`${API_URL}/admin/blogs`, {
    params: { search },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
 
export const getBlogById = async (id, token) => {
  const res = await axios.get(`${API_URL}/admin/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
 
export const createBlog = async (formData, token) => {
  const data = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (key === "tags") {
      data.append(key, Array.isArray(value) ? value.join(",") : value);
    } else if (value !== null && value !== undefined) {
      data.append(key, value);
    }
    console.log("DEBUG blogService: appended", key);
  });
 
  const res = await axios.post(`${API_URL}/admin/blogs`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
 
export const updateBlog = async (id, formData, token) => {
  console.log("DEBUG blogService: updateBlog start", formData);
  const data = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (key === "tags") {
      data.append(key, Array.isArray(value) ? value.join(",") : value);
    } else if (value !== null && value !== undefined) {
      data.append(key, value);
    }
    console.log("DEBUG blogService: appended", key);
  });
 
  console.log("DEBUG blogService: about to call axios.put");
  const res = await axios.put(`${API_URL}/admin/blogs/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("DEBUG blogService: axios.put resolved with status", res.status);
  return res.data;
};
 
export const deleteBlog = async (id, token) => {
  const res = await axios.delete(`${API_URL}/admin/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};