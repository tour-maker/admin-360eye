import { useState, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import logo2 from "../../assets/images/360eye_logo 4.png";
import { uploadZipFile } from "../../services/uploadZipService";
import { fetchAlbums, fetchAlbumImages, updateImage, deleteImage, deleteAllAlbumImages } from "../../services/albumService";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { motion } from 'framer-motion';


Modal.setAppElement('#root');

const UploadZIP = () => {
  // State management
  const [formData, setFormData] = useState({
    uploadZip: null,
    albumPage: ""
  });
  const [albums, setAlbums] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingImages, setDeletingImages] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    architake: "",
    aria: "",
    order: "",
    status: "Yes"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    title: '',
    order: '',
    status: ''
  });
  const { token } = useSelector(state => state.auth);


  // Dropzone configuration
  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: {
      'application/zip': [],
      'application/x-zip-compressed': [],
      'application/octet-stream': ['.zip']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (!file.type.includes('zip')) {
          const newFile = new File([file], file.name, { 
            type: 'application/zip'
          });
          setFormData(prevData => ({
            ...prevData,
            uploadZip: newFile
          }));
        } else {
          setFormData(prevData => ({
            ...prevData,
            uploadZip: file
          }));
        }
      }
    },
    validator: file => {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        return {
          code: 'file-invalid-type',
          message: 'File must be a ZIP file'
        };
      }
      return null;
    },
    noClick: false,
    noKeyboard: false
  });

  // Handle file rejection errors
  useEffect(() => {
    if (fileRejections.length > 0) {
      fileRejections.forEach(rejection => {
        const errorMessage = rejection.errors.map(e => e.message).join(', ');
        toast.error(`File rejected: ${errorMessage}`);
      });
    }
  }, [fileRejections]);

  // Fetch albums
  useEffect(() => {
    const fetchAlbumsData = async () => {
      setLoading(true);
      try {
        const data = await fetchAlbums(token);
        setAlbums(data.albums);
      } catch (error) {
        console.error("Error fetching albums:", error);
        toast.error("Failed to load albums");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAlbumsData();
  }, [token]);

  // Load images for album
  const loadAlbumImages = async (albumId) => {
    setImageLoading(true);
    try {
      const data = await fetchAlbumImages(albumId, token);
      setImages(data.images);
    } catch (error) {
      console.error("Error fetching album images:", error);
      toast.error("Failed to load images");
    } finally {
      setImageLoading(false);
    }
  };

  // Handle form changes
  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === "albumPage" && value) {
      loadAlbumImages(value);
    }
  };

  // Handle form submission
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!formData.uploadZip || !formData.albumPage) {
      toast.error("Please select a ZIP file and an album");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadZipFile(
        token,
        formData.uploadZip,
        formData.albumPage
      );
      
      if (response.success) {
        toast.success("Images uploaded successfully!");
        setFormData({
          uploadZip: null,
          albumPage: ""
        });
        // Reload images for the selected album
        if (formData.albumPage) {
          loadAlbumImages(formData.albumPage);
        }
      } else {
        toast.error(response.message || "Error uploading images");
      }
    } catch (error) {
      console.error("Error uploading ZIP:", error);
      toast.error("Error uploading ZIP file");
    } finally {
      setUploading(false);
    }
  };

  // Edit functionality
  const handleEdit = (image) => {
    setEditingImage(image);
    setEditFormData({
      title: image.projectname || "",
      architake: image.architake || "",
      aria: image.aria || "",
      order: image.imageOrder || "",
      status: image.imageStatus || "Yes"
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateImage(token, editingImage._id, {
        projectname: editFormData.title,
        architake: editFormData.architake,
        aria: editFormData.aria,
        imageOrder: editFormData.order,
        imageStatus: editFormData.status
      });
      
      setImages(prev => prev.map(img => 
        img._id === editingImage._id ? { 
          ...img, 
          projectname: editFormData.title,
          architake: editFormData.architake,
          aria: editFormData.aria,
          imageOrder: editFormData.order,
          imageStatus: editFormData.status
        } : img
      ));
      
      // toast.success("Image updated successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update image");
    }
  };

  // Delete functionality
  const handleDelete = async (imageId) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteImage(token, imageId);
        setImages(prev => prev.filter(img => img._id !== imageId));
        // toast.success("Image deleted successfully!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete image");
      }
    }
  };

  // Format image URL
  const formatImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/150?text=No+Image";
    return url.startsWith('http') ? url : `${import.meta.env.VITE_BACKEND_URL}${url}`;
  };

  // Sorting functionality
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort images
  const filteredAndSortedImages = useMemo(() => {
    let filteredImages = [...images];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredImages = filteredImages.filter(image => 
        (image.projectname?.toLowerCase().includes(term)) ||
        (image.imageOrder?.toString().includes(term)) ||
        (image.imageStatus?.toLowerCase().includes(term))
      );
    }
    
    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredImages = filteredImages.filter(image => 
          String(image[key === 'title' ? 'projectname' : key] || '').toLowerCase().includes(value.toLowerCase())
        );
      }
    });
    
    // Apply sorting
    if (sortConfig.key) {
      filteredImages.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredImages;
  }, [images, searchTerm, filters, sortConfig]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      title: '',
      architake: '',
      aria: '',
      order: '',
      status: ''
    });
    setSortConfig({ key: null, direction: 'asc' });
  };

  return (
    <>
      <div>
        <img src={logo2} alt="logo" className="absolute right-9 top-6" />
        <h1 className="text-2xl font-bold p-5"></h1>

        {/* Upload Form Section */}
        <div className="max-w-2xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10">
          <h2 className="text-xl font-semibold mb-6">
            Upload Images with Zip File
          </h2>

          <div className="w-full bg-warning-300 rounded-md text-white p-2 mb-8">
            Image name must be a number because it takes as order number
          </div>

          <form onSubmit={handleOnSubmit} className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Zip
                </label>
                <div
                  {...getRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
                >
                  <input {...getInputProps()} />
                  {formData.uploadZip ? (
                    <div className="text-gray-500 flex flex-col items-center justify-center mt-[5%]">
                      <p>{formData.uploadZip.name}</p>
                      <p className="text-sm">Size: {(formData.uploadZip.size / 1024).toFixed(2)} KB</p>
                      <p className="text-sm">Type: {formData.uploadZip.type || 'application/zip'}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 flex justify-center mt-[5%]">
                      Drag & drop a ZIP file here, or click to select one
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Album
                </label>
                <select
                  name="albumPage"
                  value={formData.albumPage}
                  onChange={handleOnChange}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Select Album</option>
                  {albums.map((album) => (
                    <option key={album._id} value={album._id}>
                      {album.albumName}
                    </option>
                  ))}
                </select>
              </div>
              

            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="w-full bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300 disabled:bg-gray-400"
                disabled={uploading || !formData.uploadZip || !formData.albumPage}
              >
                {uploading ? "Uploading..." : "Upload Zip"}
              </button>
              
              {formData.albumPage && (
                <button
                  type="button"
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 disabled:bg-gray-400"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={deletingImages || !formData.albumPage}
                >
                  {deletingImages ? "Deleting..." : "Delete All Images"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Image Table with Advanced Features */}
        <div className="max-w-6xl mx-auto mt-10 bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10">
          <h2 className="text-xl font-semibold mb-6">Album Images</h2>
          
          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search titles, orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* <button
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    title: '',
                    order: '',
                    status: ''
                  });
                  setSortConfig({ key: null, direction: 'asc' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                X
              </button> */}
            </div>
            
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={filters.title}
                  onChange={(e) => setFilters({...filters, title: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="text"
                  value={filters.order}
                  onChange={(e) => setFilters({...filters, order: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All</option>
                  <option value="Yes">Active</option>
                  <option value="No">Inactive</option>
                </select>
              </div>
            </div> */}
          </div>
          
          {imageLoading ? (
            <div className="text-center py-10">Loading images...</div>
          ) : filteredAndSortedImages.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {images.length === 0 
                ? (formData.albumPage ? "No images in this album" : "Please select an album to view images")
                : "No images match your filters"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thumbnail
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('projectname')}
                    >
                      <div className="flex items-center">
                        Title
                        {sortConfig.key === 'projectname' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ArchiTech
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Aria
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('imageOrder')}
                    >
                      <div className="flex items-center">
                        Order
                        {sortConfig.key === 'imageOrder' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('imageStatus')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === 'imageStatus' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedImages.map(image => (
                    <tr key={image._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={formatImageUrl(image.thumbPhoto)}
                          alt="Thumbnail"
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=Thumbnail';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {image.projectname || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {image.architake || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {image.aria || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {image.imageOrder || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          image.imageStatus === "Yes" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {image.imageStatus === "Yes" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center space-x-3">
    <button
      onClick={() => handleEdit(image)}
      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
      title="Edit"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span className="ml-1 sr-only">Edit</span>
    </button>
    
    <button
      onClick={() => handleDelete(image._id)}
      className="text-red-600 hover:text-red-800 transition-colors flex items-center"
      title="Delete"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="ml-1 sr-only">Delete</span>
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
   
      </div>

      {/* Edit Modal */}
      <Modal
  isOpen={isModalOpen}
  onRequestClose={() => setIsModalOpen(false)}
  className="modal"
  overlayClassName="modal-overlay"
  closeTimeoutMS={200}
>
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-100"
  >
    {/* Modal Header */}
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Image Details
      </h2>
    </div>
    
    {/* Modal Body */}
    <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
      {/* Title Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <div className="relative">
          <input
            type="text"
            name="title"
            value={editFormData.title}
            onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            placeholder="Image title"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ArchiTech Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          ArchiTech
        </label>
        <div className="relative">
          <textarea
            name="architake"
            value={editFormData.architake}
            onChange={(e) => setEditFormData({...editFormData, architake: e.target.value})}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            rows="3"
            placeholder="Architectural details"
          />
          <div className="absolute top-3 right-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Aria Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Aria
        </label>
        <div className="relative">
          <textarea
            name="aria"
            value={editFormData.aria}
            onChange={(e) => setEditFormData({...editFormData, aria: e.target.value})}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            rows="3"
            placeholder="Area details"
          />
          <div className="absolute top-3 right-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Order and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Order
          </label>
          <div className="relative">
            <input
              type="number"
              name="order"
              value={editFormData.order}
              onChange={(e) => setEditFormData({...editFormData, order: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              placeholder="0"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="relative">
            <select
              name="status"
              value={editFormData.status}
              onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition appearance-none"
            >
              <option value="Yes">Active</option>
              <option value="No">Inactive</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center"
        >
          Cancel
        </button>
        <button
            type="submit"
            className="px-5 py-2.5 bg-[#008000] text-white rounded-lg hover:bg-blue-600 transition shadow-sm flex text-green items-center">
            <svg className="w-4 h-4 mr-2 bg-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
        </button>
      </div>
    </form>
  </motion.div>
</Modal>

<style jsx>{`
  .modal {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    border: none;
    background: transparent;
    overflow: hidden;
    border-radius: 0.75rem;
    outline: none;
    padding: 0;
    width: 90%;
    max-width: 28rem;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(2px);
  }
`}</style>

{/* Delete Confirmation Modal */}
<Modal
  isOpen={isDeleteConfirmOpen}
  onRequestClose={() => setIsDeleteConfirmOpen(false)}
  className="modal"
  overlayClassName="modal-overlay"
  contentLabel="Delete Confirmation"
>
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-100"
  >
    {/* Modal Header */}
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
        <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete All Images
      </h2>
    </div>
    
    {/* Modal Body */}
    <div className="p-6">
      <p className="text-gray-700 mb-6">
        Are you sure you want to delete <strong>all images</strong> from this album? This action cannot be undone.
      </p>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => setIsDeleteConfirmOpen(false)}
          className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={async () => {
            setDeletingImages(true);
            try {
              const result = await deleteAllAlbumImages(token, formData.albumPage);
              if (result.success) {
                toast.success(result.message || "All images deleted successfully");
                loadAlbumImages(formData.albumPage); // Refresh the image list
              } else {
                toast.error(result.message || "Failed to delete all images");
              }
            } catch (error) {
              console.error("Error deleting all images:", error);
              toast.error("Error deleting all images");
            } finally {
              setDeletingImages(false);
              setIsDeleteConfirmOpen(false);
            }
          }}
          className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm flex items-center"
          disabled={deletingImages}
        >
          {deletingImages ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete All
            </>
          )}
        </button>
      </div>
    </div>
  </motion.div>
</Modal>
    </>
  );
};

export default UploadZIP;