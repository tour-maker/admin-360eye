import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../components/common/ConfirmationModal";
import logo2 from "../assets/images/360eye_logo 4.png";

import {
  fetchRedirects,
  addRedirect,
  updateRedirect,
  deleteRedirect,
} from "../services/redirectService";

const PageRedirect = () => {
  const { token } = useSelector((state) => state.auth);
  const [redirects, setRedirects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [redirectToDelete, setRedirectToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRedirect, setCurrentRedirect] = useState(null);

  const [formData, setFormData] = useState({
    oldUrl: "",
    newUrl: "",
  });

  // Fetch redirects on page load or when search query/page changes
  useEffect(() => {
    loadRedirects();
  }, [page, limit, searchQuery]);


  
  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing]);

  const loadRedirects = async () => {
    try {
      const data = await fetchRedirects(token, searchQuery, page, limit);
      setRedirects(data.redirects);
    } catch (error) {
      console.error("Error loading redirects:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setRedirectToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRedirect(id, token);
      loadRedirects();
    } catch (error) {
      console.error("Error deleting redirect:", error);
    }
  };

  const handleEdit = (redirect) => {
    setIsEditing(true);
    setCurrentRedirect(redirect);
    setFormData({
      oldUrl: redirect.oldUrl,
      newUrl: redirect.newUrl,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentRedirect(null);
    setFormData({
      oldUrl: "",
      newUrl: "",
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
      if (isEditing && currentRedirect) {
        await updateRedirect(currentRedirect._id, formData, token);
      } else {
        await addRedirect(formData, token);
      }
      loadRedirects();
      handleCancelEdit();
    } catch (error) {
      console.error("Error submitting redirect:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const filteredRedirects = redirects.filter(
    (redirect) =>
      redirect.oldUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      redirect.newUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRedirects.length / limit);
  const paginatedRedirects = filteredRedirects.slice(
    (page - 1) * limit,
    page * limit
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-secondary-100 flex flex-col">
      {/* Logo */}
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />

      {/* Add/Edit Redirect Form */}
      <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">
          {isEditing ? "Edit Redirect" : "Add Redirect"}
        </h2>
        <form onSubmit={handleOnSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Old URL
              </label>
              <input
                type="text"
                name="oldUrl"
                value={formData.oldUrl}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter old URL path (e.g., /gallery/?name=mrsaree)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New URL
              </label>
              <input
                type="text"
                name="newUrl"
                value={formData.newUrl}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter new URL (e.g., https://google.com or /new-path)"
                required
              />
            </div>
          </div>
          <div className="flex space-x-4 w-[40%]">
            <button
              type="submit"
              className="w-full bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300"
            >
              {isEditing ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              onClick={isEditing ? handleCancelEdit : () => setFormData({ oldUrl: "", newUrl: "" })}
              className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              {isEditing ? "Cancel" : "Reset"}
            </button>
          </div>
        </form>
      </div>

      {/* Redirects Table */}
      <div className="md:w-[90%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">Manage Redirects</h2>
        <div className="mb-6">
          <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
          <input
            type="text"
            placeholder="Search redirects..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full md:w-1/2 px-4 py-2 pl-7 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-400 text-white">
              <th className="p-3 text-left">Old URL</th>
              <th className="p-3 text-left">New URL</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRedirects.map((redirect) => (
              <tr
                key={redirect._id}
                className="border-b border-accent-300 hover:bg-secondary-100"
              >
                <td className="p-3">{redirect.oldUrl}</td>
                <td className="p-3">{redirect.newUrl}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(redirect)}
                    className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(redirect._id)}
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
          handleDelete(redirectToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this redirect?"
        action="Delete"
      />
    </div>
  );
};

export default PageRedirect;