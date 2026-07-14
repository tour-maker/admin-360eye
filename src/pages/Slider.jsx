import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../components/common/ConfirmationModal";
import logo2 from "../assets/images/360eye_logo 4.png";

import {
  fetchSliders,
  addSlider,
  updateSlider,
  deleteSlider,
} from "../services/sliderService";

const Slider = () => {
  const { token } = useSelector((state) => state.auth);
  const [sliders, setSliders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlider, setCurrentSlider] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    sliderLink: "",
    sliderOrder: "",
    sliderStatus: "",
    clientLogo: null,
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prevData) => ({
        ...prevData,
        clientLogo: acceptedFiles[0],
      }));
    },
  });

  // Fetch sliders on page load or when search query/page changes
  useEffect(() => {
    loadSliders();
  }, [page, limit, searchQuery]);

  const loadSliders = async () => {
    try {
      const data = await fetchSliders(token, searchQuery, page, limit);
      setSliders(data.sliders);
    } catch (error) {
      console.error("Error loading sliders:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setSliderToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSlider(id, token);
      loadSliders();
    } catch (error) {
      console.error("Error deleting slider:", error);
    }
  };

  const handleEdit = (slider) => {
    setIsEditing(true);
    setCurrentSlider(slider);
    setFormData({
      title: slider.title,
      sliderLink: slider.sliderLink,
      sliderOrder: slider.sliderOrder,
      sliderStatus: slider.sliderStatus,
      clientLogo: slider.clientLogo,
    });
  };

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentSlider(null);
    setFormData({
      title: "",
      sliderLink: "",
      sliderOrder: "",
      sliderStatus: "",
      clientLogo: null,
    });
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    console.log('Field changed:', name, value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && currentSlider) {
        await updateSlider(currentSlider._id, formData, token);
      } else {
        await addSlider(formData, token);
      }
      loadSliders();
      handleCancelEdit();
    } catch (error) {
      console.error("Error submitting slider:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const filteredSliders = sliders.filter(
    (slider) =>
      slider.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slider.sliderLink.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSliders.length / limit);
  const paginatedSliders = filteredSliders.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-secondary-100 flex flex-col">
      {/* Logo */}
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />


      {/* Add/Edit Client Form */}
      <div className=" w-[60%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">
          {isEditing ? "Edit Client" : "Add Client"}
        </h2>
        <form onSubmit={handleOnSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter title"
                required
              />
            </div>

            {/* Client Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Client Link
              </label>
              <input
                type="url"
                name="sliderLink"
                value={formData.sliderLink || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    sliderLink: newValue
                  }));
                }}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter client link"
                required
              />
            </div>

            {/* Slider Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Client Order
              </label>
              <input
                type="number"
                name="sliderOrder"
                value={formData.sliderOrder}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter slider order"
                required
              />
            </div>

            {/* Slider Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slider Status
              </label>
              <select
                name="sliderStatus"
                value={formData.sliderStatus}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select Slider Status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Client Logo Dropzone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Client Logo
              </label>
              <div
                {...getRootProps()}
                className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
              >
                <input {...getInputProps()} />
                {formData.clientLogo ? (
                  typeof formData.clientLogo === "string" ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${formData.clientLogo}`}
                      alt="Client Logo"
                      className="max-h-32"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(formData.clientLogo)}
                      alt="Client Logo"
                      className="max-h-32"
                    />
                  )
                ) : (
                  <p className="text-gray-500 flex justify-center mt-[5%]">
                    Drag & drop an image here, or click to select one
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 w-[40%]">
            <button
              type="submit"
              className="w-full bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300"
            >
              {isEditing ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={isEditing ? handleCancelEdit : () => setFormData({
                title: "",
                sliderLink: "",
                sliderOrder: "",
                sliderStatus: "",
                clientLogo: null,
              })}
              className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              {isEditing ? "Cancel" : "Reset"}
            </button>
          </div>
        </form>
      </div>

      {/* Sliders Table */}
      <div className="md:w-[92%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">Manage Client</h2>
        <div className="mb-6">
          <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
          <input
            type="text"
            placeholder="Search sliders..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full md:w-1/2 px-4 py-2 pl-7 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-400 text-white">
              <th className="p-3 text-left">Client Logo</th>
              <th className="p-3 text-left">Client Link</th>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSliders.map((slider) => (
              <tr
                key={slider._id}
                className="border-b border-accent-300 hover:bg-secondary-100"
              >
                <td className="p-3">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/uploads/sliders/${slider.clientLogo}`}
                    alt="Client Logo"
                    className="w-12 h-12 rounded-md"
                  />
                </td>
                <td className="p-3">{slider.sliderLink}</td>
                <td className="p-3">{slider.sliderOrder}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      slider.sliderStatus === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {slider.sliderStatus}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(slider)}
                    className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(slider._id)}
                    className="bg-error-200 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-accent-300 rounded-l-md bg-white text-primary-500 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <button
                key={pageNumber + 1}
                onClick={() => handlePageChange(pageNumber + 1)}
                className={`px-4 py-2 border-t border-b border-accent-300 ${
                  page === pageNumber + 1
                    ? "bg-primary-400 text-white"
                    : "bg-white text-primary-500 hover:bg-secondary-100"
                }`}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-accent-300 rounded-r-md bg-white text-primary-500 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleDelete(sliderToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this slider?"
        action="Delete"
      />
    </div>
  );
};

export default Slider;