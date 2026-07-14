import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { IoArrowUp, IoArrowDown } from "react-icons/io5";
import ConfirmationModal from "../common/ConfirmationModal";
import { 
  fetchSliders,
  deleteSlider,
  updateSliderOrder,
} from "../../services/sliderService";
import Pagination from "../Pagination";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SliderRow = ({ slider, onEdit, onDelete, onMoveUp, onMoveDown, index, totalItems, onDragStart, onDragEnd, onDragOver, onDrop, isDragging }) => {
  return (
    <tr 
      className={`border-b border-accent-300 hover:bg-secondary-100 ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={() => onDragStart(slider)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={() => onDrop(slider)}
    >
      <td className="p-3">
        <div className="flex items-center gap-1">
          <div className="cursor-move text-gray-400 hover:text-primary-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="1"/>
              <circle cx="15" cy="5" r="1"/>
              <circle cx="9" cy="12" r="1"/>
              <circle cx="15" cy="12" r="1"/>
              <circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onMoveUp(slider, index)}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Up"
            >
              <IoArrowUp size={12} />
            </button>
            <button
              onClick={() => onMoveDown(slider, index)}
              disabled={index === totalItems - 1}
              className="p-1 text-gray-400 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Down"
            >
              <IoArrowDown size={12} />
            </button>
          </div>
        </div>
      </td>
      <td className="p-3">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/uploads/sliders/${slider.clientLogo}`}
          alt="Client Logo"
          className="w-12 h-12 rounded-md object-cover"
        />
      </td>
      <td className="p-3">{slider.title}</td>
      <td className="p-3">{slider.sliderLink}</td>
      <td className="p-3">{slider.sliderOrder}</td>
      <td className="p-3">
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            slider.sliderStatus === "Yes"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {slider.sliderStatus}
        </span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(slider)}
            className="p-2 bg-accent-400 text-white rounded hover:bg-accent-600 transition duration-300"
            title="Edit"
          >
            <HiOutlinePencil size={16} />
          </button>
          <button
            onClick={() => onDelete(slider._id)}
            className="p-2 bg-error-200 text-white rounded hover:bg-red-700 transition duration-300"
            title="Delete"
          >
            <HiOutlineTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const SliderTable = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState('sliderOrder');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [allSliders, setAllSliders] = useState([]);
  const [filteredSliders, setFilteredSliders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [draggedSlider, setDraggedSlider] = useState(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  useEffect(() => {
    if (token) {
      loadAllSliders();
    }
  }, [token]);

  useEffect(() => {
    filterSliders();
  }, [searchQuery, allSliders]);

  useEffect(() => {
    updatePagination();
  }, [filteredSliders, page, limit]);

  const loadAllSliders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchSliders(token, '');
      
      if (response && response.success) {
        const sortedSliders = (response.sliders || []).sort((a, b) => a.sliderOrder - b.sliderOrder);
        setAllSliders(sortedSliders);
        setFilteredSliders(sortedSliders);
      } else {
        setAllSliders([]);
        setFilteredSliders([]);
        toast.error('Failed to load clients');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients. Please try again later.');
      setAllSliders([]);
      setFilteredSliders([]);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSliders = () => {
    if (!searchQuery || searchQuery.trim() === '') {
      setFilteredSliders(allSliders);
      return;
    }

    const filtered = allSliders.filter(slider => 
      slider.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slider.sliderLink?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slider.sliderOrder?.toString().includes(searchQuery)
    );
    
    setFilteredSliders(filtered);
    setPage(1);
  };

  const updatePagination = () => {
    const total = filteredSliders.length;
    setTotalItems(total);
    setTotalPages(Math.ceil(total / limit));
  };

  const getCurrentPageSliders = () => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredSliders.slice(startIndex, endIndex);
  };

  const handleDeleteClick = (id) => {
    setSliderToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!sliderToDelete) return;
    
    try {
      await deleteSlider(sliderToDelete, token);
      toast.success("Client deleted successfully");
      setIsModalOpen(false);
      setSliderToDelete(null);
      loadAllSliders();
    } catch (error) {
      toast.error("Failed to delete client");
      console.error("Error deleting client:", error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleEdit = (slider) => {
    navigate(`/slider/edit/${slider._id}`, { state: { slider } });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDragStart = (slider) => {
    setDraggedSlider(slider);
  };

  const handleDragEnd = () => {
    setDraggedSlider(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetSlider) => {
    if (!draggedSlider || draggedSlider._id === targetSlider._id) {
      return;
    }

    setIsUpdatingOrder(true);
    
    const draggedOrder = draggedSlider.sliderOrder;
    const targetOrder = targetSlider.sliderOrder;
    
    const updatedSliders = allSliders.map(slider => {
      if (slider._id === draggedSlider._id) {
        return { ...slider, sliderOrder: targetOrder };
      }
      if (slider._id === targetSlider._id) {
        return { ...slider, sliderOrder: draggedOrder };
      }
      return slider;
    }).sort((a, b) => a.sliderOrder - b.sliderOrder);
    
    setAllSliders(updatedSliders);
    setDraggedSlider(null);
    
    try {
      await updateSliderOrder(draggedSlider._id, targetOrder, token);
      await updateSliderOrder(targetSlider._id, draggedOrder, token);
      toast.success("Client order updated successfully");
    } catch (error) {
      console.error('Error updating client order:', error);
      toast.error("Failed to update client order");
      await loadAllSliders();
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleMoveUp = async (slider, index) => {
    const currentPageSliders = getCurrentPageSliders();
    if (index === 0) return;
    
    const targetSlider = currentPageSliders[index - 1];
    if (!targetSlider) return;
    
    const sliderOrder = slider.sliderOrder;
    const targetOrder = targetSlider.sliderOrder;
    
    const updatedSliders = allSliders.map(s => {
      if (s._id === slider._id) {
        return { ...s, sliderOrder: targetOrder };
      }
      if (s._id === targetSlider._id) {
        return { ...s, sliderOrder: sliderOrder };
      }
      return s;
    }).sort((a, b) => a.sliderOrder - b.sliderOrder);
    
    setAllSliders(updatedSliders);
    
    try {
      await updateSliderOrder(slider._id, targetOrder, token);
      await updateSliderOrder(targetSlider._id, sliderOrder, token);
      toast.success("Client moved up successfully");
    } catch (error) {
      console.error('Error moving client up:', error);
      toast.error("Failed to move client");
      await loadAllSliders();
    }
  };

  const handleMoveDown = async (slider, index) => {
    const currentPageSliders = getCurrentPageSliders();
    if (index === currentPageSliders.length - 1) return;
    
    const targetSlider = currentPageSliders[index + 1];
    if (!targetSlider) return;
    
    const sliderOrder = slider.sliderOrder;
    const targetOrder = targetSlider.sliderOrder;
    
    const updatedSliders = allSliders.map(s => {
      if (s._id === slider._id) {
        return { ...s, sliderOrder: targetOrder };
      }
      if (s._id === targetSlider._id) {
        return { ...s, sliderOrder: sliderOrder };
      }
      return s;
    }).sort((a, b) => a.sliderOrder - b.sliderOrder);
    
    setAllSliders(updatedSliders);
    
    try {
      await updateSliderOrder(slider._id, targetOrder, token);
      await updateSliderOrder(targetSlider._id, sliderOrder, token);
      toast.success("Client moved down successfully");
    } catch (error) {
      console.error('Error moving client down:', error);
      toast.error("Failed to move client");
      await loadAllSliders();
    }
  };
  
  return (
    <div className="max-w-sm md:max-w-[92%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Clients</h2>
        {isUpdatingOrder && (
          <span className="text-sm text-blue-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Updating order...
          </span>
        )}
        <button
          onClick={() => navigate('/slider/add')}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition duration-300"
        >
          Add Client
        </button>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex flex-1">
          <div className="relative flex-grow">
            <IoSearchOutline className="absolute left-3 top-3 text-accent-600" />
            <input
              type="text"
              placeholder="Search clients..."
              aria-label="Search clients"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Show:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">of {totalItems} results</span>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Page:</label>
            <select
              value={page}
              onChange={(e) => handlePageChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <option key={pageNum} value={pageNum}>
                  {pageNum}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">of {totalPages}</span>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-accent-600">Loading clients...</p>
        </div>
      )}
      
      {!isLoading && error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={loadAllSliders}
            className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
            Try Again
          </button>
        </div>
      )}
      
      {!isLoading && !error && filteredSliders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-accent-600">No clients found</p>
        </div>
      )}
      
      {!isLoading && !error && getCurrentPageSliders().length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary-400 text-white">
                  <th className="p-3 text-left w-16">Order</th>
                  <th className="p-3 text-left">Logo</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Link</th>
                  <th className="p-3 text-left">Order #</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageSliders().map((slider, index) => {
                  const currentPageSliders = getCurrentPageSliders();
                  return (
                    <SliderRow
                      key={slider._id}
                      slider={slider}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      index={index}
                      totalItems={currentPageSliders.length}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragging={draggedSlider?._id === slider._id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={parseInt(page)}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleDelete(sliderToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this client?"
        action="Delete"
      />
    </div>
  );
};

export default SliderTable;
