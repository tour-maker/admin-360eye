import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../components/common/ConfirmationModal";
import Pagination from "../components/Pagination";
import { fetchEnquiries, deleteEnquiry } from "../services/enquiryService"; // Import services
import { useSelector } from "react-redux";

const Enquiry = () => {
  const { token } = useSelector((state) => state.auth);
  const [enquiries, setEnquiries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

  // Fetch enquiries on component mount
  useEffect(() => {
    const loadEnquiries = async () => {
      try {
        const data = await fetchEnquiries(token);
        setEnquiries(data);
      } catch (error) {
        console.error("Error loading enquiries:", error);
      }
    };

    loadEnquiries();
  }, [token]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // Filter enquiries based on search query
  const filteredEnquiries = enquiries.filter(
    (enquiry) =>
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate enquiries
  const totalPages = Math.ceil(filteredEnquiries.length / limit);
  const paginatedEnquiries = filteredEnquiries.slice(
    (page - 1) * limit,
    page * limit
  );

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Handle delete enquiry
  const handleDeleteClick = (id) => {
    setEnquiryToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteEnquiry(enquiryToDelete, token);
      setEnquiries((prev) =>
        prev.filter((enquiry) => enquiry._id !== enquiryToDelete)
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting enquiry:", error);
    }
  };

  return (
    <div className="max-w-sm md:max-w-[92%] ml-0 md:ml-10 mt-10 p-4 flex-1 bg-secondary-50 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Manage Enquiries</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
        <input
          type="text"
          placeholder="Search enquiries..."
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
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEnquiries.map((enquiry) => (
              <tr
                key={enquiry._id}
                className="border-b border-accent-300 hover:bg-secondary-100"
              >
                <td className="p-3">{enquiry.name}</td>
                <td className="p-3">{enquiry.phone}</td>
                <td className="p-3">{enquiry.email}</td>
                <td className="p-3">{enquiry.message}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDeleteClick(enquiry._id)}
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

      {/* Pagination */}
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
        message="Are you sure you want to delete this enquiry?"
        action="Delete"
      />
    </div>
  );
};

export default Enquiry;