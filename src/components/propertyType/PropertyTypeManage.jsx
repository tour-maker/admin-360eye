import { useEffect, useState } from "react";
import {
  fetchPropertyTypes,
  deletePropertyType,
} from "../../services/propertyTypeService";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../common/ConfirmationModal";
import AddPropertyType from "./AddPropertyType"; // Import the form component
import Pagination from "../Pagination"; // Reusable Pagination component

const PropertyTypeManage = ({ reload, onEditPropertyType }) => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const { token } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyTypeToDelete, setPropertyTypeToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPropertyType, setCurrentPropertyType] = useState(null);

  useEffect(() => {
    loadPropertyTypes();
  }, [page, limit, searchQuery, reload]);

  const loadPropertyTypes = async () => {
    try {
      const data = await fetchPropertyTypes(token);
      setPropertyTypes(data.propertyTypes);
    } catch (error) {
      console.error("Error loading property types:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setPropertyTypeToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePropertyType(id, token);
      loadPropertyTypes();
    } catch (error) {
      console.error("Error deleting property type:", error);
    }
  };

  const handleEdit = (propertyType) => {
    setIsEditing(true);
    onEditPropertyType(propertyType);
  };

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing, currentPropertyType]);
  

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentPropertyType(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const filteredPropertyTypes = propertyTypes.filter((pt) =>
    pt.propertyName.toLowerCase().includes(searchQuery.toLowerCase() || "")
  );

  const totalPages = Math.ceil(filteredPropertyTypes.length / limit);
  const paginatedPropertyTypes = filteredPropertyTypes.slice(
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
      <h2 className="text-xl font-semibold mb-6">Manage Property Types</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
        <input
          type="text"
          placeholder="Search property types..."
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
              <th className="p-3 text-left">Property Type Name</th>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPropertyTypes.map((pt) => (
              <tr
                key={pt._id}
                className="border-b border-accent-300 hover:bg-secondary-100"
              >
                <td className="p-3">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${pt.propertyPhoto}`}
                    alt="icon"
                    className="w-12 h-12 rounded-md"
                  />
                </td>
                <td className="p-3">{pt.propertyName}</td>
                <td className="p-3">{pt.orderNo}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      pt.status === "Yes" || pt.status === true // Handle both string and boolean
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                      {pt.status == "Yes"  || pt.status == true ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(pt)}
                    className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(pt._id)}
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
          handleDelete(propertyTypeToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this property type?"
        action="Delete"
      />
    </div>
  );
};

export default PropertyTypeManage;
