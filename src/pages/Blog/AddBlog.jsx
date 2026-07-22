import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createBlog, updateBlog } from "../../services/blogService";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
 
const API_URL = import.meta.env.VITE_BACKEND_URL;

// Compress/resize an image client-side so uploads stay under CloudFront's 1MB body limit
const compressImage = (file, maxWidth = 1200, quality = 0.75) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
 
const AddBlog = ({ isEditing }) => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();
  const location = useLocation();
  const blogToEdit = location.state?.blog;
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    content: "",
    author: "",
    tags: "",
    status: "draft",
    publishedDate: new Date().toISOString().split("T")[0],
  });
 
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      try {
        const compressed = await compressImage(acceptedFiles[0]);
        setFormData((prev) => ({ ...prev, thumbnail: compressed }));
      } catch {
        setFormData((prev) => ({ ...prev, thumbnail: acceptedFiles[0] }));
      }
    },
  });
 
  useEffect(() => {
    if (isEditing && blogToEdit) {
      setFormData({
        title: blogToEdit.title || "",
        shortDescription: blogToEdit.shortDescription || "",
        content: blogToEdit.content || "",
        author: blogToEdit.author || "360 EYE Team",
        tags: Array.isArray(blogToEdit.tags) ? blogToEdit.tags.join(", ") : blogToEdit.tags || "",
        status: blogToEdit.status || "published",
        thumbnail: blogToEdit.thumbnail || null,
      });
    }
  }, [isEditing, blogToEdit]);
 
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        await updateBlog(id, formData, token);
        toast.success("Blog updated successfully");
      } else {
        await createBlog(formData, token);
        toast.success("Blog created successfully");
      }
      navigate("/blog");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };
 
  const thumbnailPreview = () => {
    if (!formData.thumbnail) return null;
    if (typeof formData.thumbnail === "string") {
      return `${API_URL}/uploads/blogs/${formData.thumbnail}`;
    }
    return URL.createObjectURL(formData.thumbnail);
  };

  const quillModules = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['blockquote', 'link'],
    ['clean']
  ]
  };
 
  return (
    <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? "Edit Blog" : "Add Blog"}
      </h2>
      <form onSubmit={handleOnSubmit} className="space-y-6">
        {/* Published Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Published Date
          </label>
          <input
            type="date"
            name="publishedDate"
            value={formData.publishedDate}
            onChange={handleOnChange}
            className="w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <ReactQuill
            theme="snow"
            value={formData.title}
            onChange={(value) => {
              const slug = value.replace(/<[^>]*>/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
              setFormData((prev) => ({ ...prev, title: value, slug }));
            }}
            modules={quillModules}
            placeholder="Enter blog title"
            className="bg-white rounded-md"
          />
          </div>
 
          {/* Short Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Short Description *</label>
            <ReactQuill
            theme="snow"
            value={formData.shortDescription}
            onChange={(value) => setFormData((prev) => ({ ...prev, shortDescription: value }))}
            modules={quillModules}
            placeholder="Brief description shown in blog listing"
            className="bg-white rounded-md"
          />
          </div>
 
          {/* Content */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Content *</label>
            <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
            modules={quillModules}
            placeholder="Write your blog content here..."
            className="bg-white rounded-md"
            style={{ minHeight: '200px' }}
          />
          </div>
 
          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Author name"
            />
          </div>
 
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
 
          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Virtual Tour, Real Estate, Technology (comma separated)"
            />
          </div>
 
          {/* Thumbnail */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Thumbnail Image</label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md cursor-pointer hover:border-primary-400 transition"
            >
              <input {...getInputProps()} />
              {thumbnailPreview() ? (
                <img
                  src={thumbnailPreview()}
                  alt="Blog Thumbnail"
                  className="max-h-48 object-contain"
                />
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mt-4">Drag & drop an image here, or click to select</p>
                  <p className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
            {formData.thumbnail && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, thumbnail: null }))}
                className="mt-2 text-xs text-red-500 hover:underline"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
 
        <div className="flex space-x-4 w-full md:w-[40%]">
          <button
            type="submit"
            className="w-full bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300"
          >
            {isEditing ? "Update" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/blog")}
            className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
 
export default AddBlog; 