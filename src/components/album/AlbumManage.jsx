import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchAlbums, deleteAlbum } from "../../services/albumService";
import ConfirmationModal from "../common/ConfirmationModal";
import { IoSearchOutline } from "react-icons/io5";
import Pagination from "../Pagination";

const AlbumManage = ({ reload, onEditAlbum }) => {
  const { token } = useSelector((state) => state.auth);
  const [albums, setAlbums] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState(null);

  useEffect(() => {
    loadAlbums();
  }, [page, limit, searchQuery, reload]);

  const loadAlbums = async () => {
    try {
      const response = await fetchAlbums(token);
      setAlbums(response.albums || []);
    } catch (error) {
      console.error("Error loading albums:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setAlbumToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteAlbum(albumToDelete, token);
      setAlbums((prev) => prev.filter((album) => album._id !== albumToDelete));
    } catch (error) {
      console.error("Error deleting album:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleEdit = (album) => {
    setIsEditing(true);
    onEditAlbum(album);
  };

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing, currentAlbum]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentAlbum(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const filteredAlbums = albums.filter((album) =>
    album.albumName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAlbums.length / limit);
  const paginatedAlbums = filteredAlbums.slice(
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
      <h2 className="text-xl font-semibold mb-6">Manage Albums</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
        <input
          type="text"
          placeholder="Search albums..."
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
              <th className="p-3 text-left">Album Photo</th>
              <th className="p-3 text-left">Album Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Order No</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAlbums.map((album) => (
              <tr
                key={album._id}
                className="border-b border-accent-300 hover:bg-secondary-100"
              >
                <td className="p-3">
                  <img
                    // src={album.albumPhoto || "https://via.placeholder.com/50"}
                    src={`${import.meta.env.VITE_BACKEND_URL}${album.albumPhoto}`}
                    alt="cover"
                    className="w-12 h-12 rounded-md"
                  />
                </td>
                <td className="p-3">{album.albumName}</td>
                <td className="p-3">{album.status}</td>
                <td className="p-3">{album.orderNo}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(album)}
                    className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(album._id)}
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
        onConfirm={handleDelete}
        message="Are you sure you want to delete this album?"
        action="Delete"
      />
    </div>
  );
};

export default AlbumManage;