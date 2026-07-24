import { useEffect, useState } from "react";
import { fetchFilters, deleteFilter } from "../../services/filterService";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../common/ConfirmationModal";
import Pagination from "../Pagination";

const FiltersManage = ({ reload, onEditFilter }) => {
  const [filters, setFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const { token } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState(null);

  useEffect(() => {
    loadFilters();
  }, [page, limit, searchQuery, reload]);

  const loadFilters = async () => {
    try {
      const data = await fetchFilters(token);
      setFilters(data.filters);
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setFilterToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFilter(id, token);
      loadFilters();
    } catch (error) {
      console.error("Error deleting filter:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const filteredList = filters.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase() || "")
  );

  const totalPages = Math.ceil(filteredList.length / limit);
  const paginatedList = filteredList.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-sm md:max-w-[92%] ml-0 md:ml-10 mt-10 p-4 flex-1 bg-secondary-50 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Manage Filters</h2>

      <div className="mb-6">
        <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
        <input
          type="text"
          placeholder="Search filters..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full md:w-1/2 px-4 py-2 pl-7 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-400 text-white">
              <th className="p-3 text-left">Filter Name</th>
              <th className="p-3 text-left">Options</th>
              <th className="p-3 text-left">Multi-Select</th>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((f) => (
              <tr key={f._id} className="border-b border-accent-300 hover:bg-secondary-100">
                <td className="p-3 font-medium">{f.name}</td>
                <td className="p-3 text-sm text-gray-600">
                  {(f.options || []).join(", ") || "—"}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${f.multiSelect ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {f.multiSelect ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3">{f.filterOrder}</td>
                <td className="p-3">
                  <button
                    onClick={() => onEditFilter(f)}
                    className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(f._id)}
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

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleDelete(filterToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this filter?"
        action="Delete"
      />
    </div>
  );
};

export default FiltersManage;
