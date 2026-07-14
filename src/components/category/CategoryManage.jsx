import { useEffect, useState } from "react";
import {
  fetchCategories,
  deleteCategory,
} from "../../services/categoryService";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../common/ConfirmationModal";
import AddMainCategory from "./AddMainCategory";
import Pagination from "../Pagination";
import { CategoryScale } from "chart.js";

const CategoryManage = ({ reload, onEditCategory }) => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const { token } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, [page, limit, searchQuery, reload]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories(token);
      setCategories(data.categories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setCategoryToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id, token);
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    onEditCategory(category);
  };

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing, currentCategory]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentCategory(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / limit);
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * limit,
    page * limit
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-sm md:max-w-[92%] ml-0 md:ml-10 mt-10 p-4 flex-1 bg-secondary-50 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Manage Categories</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full md:w-1/2 px-4 py-2 pl-7 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-400 text-white">
              <th className="p-3 text-left">Image/Icon</th>
              <th className="p-3 text-left">Category Name</th>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.map((cat) => (
              <tr
                key={cat._id}
                className="border-b border-accent-300 hover:bg-secondary-100"
              >
                <td className="p-3">
                  <img
                    // src={cat.categoryPhoto || "https://via.placeholder.com/50"}
                    src={`${import.meta.env.VITE_BACKEND_URL}${cat.categoryPhoto}`}
                    alt="icon"
                    className="w-12 h-12 rounded-md"
                  />
                </td>
                <td className="p-3">{cat.categoryName}</td>
                <td className="p-3">{cat.orderNo}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      cat.status === "Yes" || cat.status === true // Handle both string and boolean
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cat.status == "Yes" || cat.status == true
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(cat._id)}
                    className="bg-error-200 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reusable Pagination Component */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleDelete(categoryToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this category?"
        action="Delete"
      />
    </div>
  );
};

export default CategoryManage;
