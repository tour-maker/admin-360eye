import { useEffect, useState } from "react";
import { fetchAreas, deleteArea } from "../../services/areaService";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Pagination from "../../components/Pagination";
import AddArea from "../../pages/AddArea";


const ManageArea = ({ reload, onEditArea }) => {
  const [areas, setAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const { token } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArea, setCurrentArea] = useState(null);

  useEffect(() => {
    loadAreas();
  }, [page, limit, searchQuery]);

  const loadAreas = async () => {
    console.log("Fetching areas...");
    try {
      const data = await fetchAreas(token);
      console.log("Fetched Areas:", data);
      setAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading areas:", error);
      setAreas([]);
    }
  };

  const handleDeleteClick = (id) => {
    setAreaToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteArea(id, token);
      loadAreas();
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  const handleEdit = (area) => {
    console.log("Editing Area Clicked:", area);
    setCurrentArea(area);
    setIsEditing(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const filteredAreas = areas
    .filter((area) => area && typeof area.area === "string")
    .filter((area) => area.area.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filteredAreas.length / limit));
  const paginatedAreas = filteredAreas.slice((page - 1) * limit, page * limit);



  return (
    <div className="max-w-sm md:max-w-[92%] ml-0 md:ml-10 mt-10 p-4 flex-1 bg-secondary-50 rounded-lg shadow-lg">
     <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        📍 Manage Areas
      </h2>

      {/* Add/Edit Area Form */}
      <AddArea
        isEditing={isEditing}
        currentArea={currentArea}
        onCancelEdit={() => {
          setIsEditing(false);
          setCurrentArea(null);
        }}
        onSuccess={loadAreas}
      />

      {/* Search Bar */}
      <div className="mb-6 relative">
        <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
        <input
          type="text"
          placeholder="Search areas..."
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
              <th className="p-3 text-left">Area Name</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAreas.map((area) => (
              <tr
                key={area._id}
                className="border-b border-accent-300 hover:bg-secondary-100"
              >
                <td className="p-3">{area.area}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(area)}
                    className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(area._id)}
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

      {/* Pagination Component */}
      <div className="mt-6">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

       {/* Confirmation Modal */}
       <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleDelete(areaToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this area?"
        action="Delete"
      />
    </div>
  );
};

export default ManageArea;
