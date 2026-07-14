import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../components/common/ConfirmationModal";
import logo2 from "../assets/images/360eye_logo 4.png";

import {
  fetchSEOs,
  createSEO,
  updateSEO,
  deleteSEO,
} from "../services/seoService";

const SEO = () => {
  const { token } = useSelector((state) => state.auth);
  const [seos, setSEOs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seoToDelete, setSeoToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSEO, setCurrentSEO] = useState(null);

  const [formData, setFormData] = useState({
    pageUrl: "",
    metadata: "",
    thumbnail: null,
    keyword: "",
    pageTitle: "",
    pageDescription: "",
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prevData) => ({
        ...prevData,
        thumbnail: acceptedFiles[0],
      }));
    },
  });

  // Fetch SEO entries on page load or when search query/page changes
  useEffect(() => {
    loadSEOs();
  }, [page, limit, searchQuery]);

  const loadSEOs = async () => {
    try {
      const data = await fetchSEOs(token, searchQuery, page, limit);
      setSEOs(data.seos);
    } catch (error) {
      console.error("Error loading SEO entries:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setSeoToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSEO(id, token);
      loadSEOs();
    } catch (error) {
      console.error("Error deleting SEO entry:", error);
    }
  };

  const handleEdit = (seo) => {
    setIsEditing(true);
    setCurrentSEO(seo);
    setFormData({
      pageUrl: seo.pageUrl,
      metadata: seo.metadata || "", // Ensure metadata is set to an empty string if it's null or undefined
      thumbnail: seo.thumbnail,
      keyword: seo.keyword,
      pageTitle: seo.pageTitle,
      pageDescription: seo.pageDescription,
    });
  };

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentSEO(null);
    setFormData({
      pageUrl: "",
      metadata: "",
      thumbnail: null,
      keyword: "",
      pageTitle: "",
      pageDescription: "",
    });
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && currentSEO) {
        await updateSEO(currentSEO._id, formData, token);
      } else {
        await createSEO(formData, token);
      }
      loadSEOs();
      handleCancelEdit();
    } catch (error) {
      console.error("Error submitting SEO entry:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // Updated search logic: Only search by pageUrl and pageTitle
  const filteredSEOs = seos.filter(
    (seo) =>
      seo.pageUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seo.pageTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSEOs.length / limit);
  const paginatedSEOs = filteredSEOs.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-secondary-100 flex flex-col">
      {/* Logo */}
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />

      {/* Add/Edit SEO Form */}
      <div className="max-w-4xl w-[60%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">
          {isEditing ? "Edit SEO Entry" : "Add SEO Entry"}
        </h2>
        <form onSubmit={handleOnSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Page URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Page URL
              </label>
              <input
                type="url"
                name="pageUrl"
                value={formData.pageUrl}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter page URL"
                required
              />
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Keyword
              </label>
              <input
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter keyword"
                required
              />
            </div>

            {/* Page Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Page Title
              </label>
              <input
                type="text"
                name="pageTitle"
                value={formData.pageTitle}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter page title"
                required
              />
            </div>

            {/* Page Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Page Description
              </label>
              <textarea
                name="pageDescription"
                value={formData.pageDescription}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter page description"
                required
              />
            </div>

            {/* Metadata */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Metadata
              </label>
              <textarea
                name="metadata"
                value={formData.metadata}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter metadata"
                rows={6}
              />
            </div>

            {/* Thumbnail Dropzone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Thumbnail
              </label>
              <div
                {...getRootProps()}
                className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
              >
                <input {...getInputProps()} />
                {formData.thumbnail ? (
                  typeof formData.thumbnail === "string" ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${formData.thumbnail}`}
                      alt="Thumbnail"
                      className="max-h-32"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail"
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
                pageUrl: "",
                metadata: "",
                thumbnail: null,
                keyword: "",
                pageTitle: "",
                pageDescription: "",
              })}
              className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              {isEditing ? "Cancel" : "Reset"}
            </button>
          </div>
        </form>
      </div>

      {/* SEO Entries Table */}
      <div className="max-w-sm md:max-w-[92%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">Manage SEO Entries</h2>
        <div className="mb-6">
          <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
          <input
            type="text"
            placeholder="Search SEO entries..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full md:w-1/2 px-4 py-2 pl-7 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-400 text-white">
              <th className="p-3 text-left">Page URL</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Keyword</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Metadata</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSEOs.map((seo) => (
              <tr
                key={seo._id}
                className="border-b border-accent-300 hover:bg-secondary-100"
              >
                <td className="p-3">{seo.pageUrl}</td>
                <td className="p-3">{seo.pageDescription}</td>
                <td className="p-3">{seo.keyword}</td>
                <td className="p-3">{seo.pageTitle}</td>
                <td className="p-3">{seo.metadata}</td>
                <td className="p-3 flex">
                  <button
                    onClick={() => handleEdit(seo)}
                    className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(seo._id)}
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
          handleDelete(seoToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this SEO entry?"
        action="Delete"
      />
    </div>
  );
};

export default SEO;