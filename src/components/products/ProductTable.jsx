import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineAnalytics } from "react-icons/md";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineKey } from "react-icons/hi";
import { IoArrowUp, IoArrowDown } from "react-icons/io5";
import ConfirmationModal from "../common/ConfirmationModal";
import { 
  fetchProducts,
  fetchProductsByCategory,
  deleteProduct,
  bulkUpdateTourURLs,
  updateProductPassword,
  updateProductOrder,
} from "../../services/productService";
import Pagination from "../Pagination";
import AddProduct from "../../pages/product/AddProduct";
import { fetchCategories } from "../../services/categoryService";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

// Separate component for the table row
const ProductRow = ({ product, onEdit, onDelete, onSetPassword, onViewAnalytics, onMoveUp, onMoveDown, index, totalItems, onDragStart, onDragEnd, onDragOver, onDrop, isDragging }) => {
  const hasAnalyticsId = Boolean(product.googleAnalyticsId?.trim());

  return (
  <tr 
    className={`border-b border-accent-300 hover:bg-secondary-100 ${isDragging ? 'opacity-50' : ''}`}
    draggable
    onDragStart={() => onDragStart(product)}
    onDragEnd={onDragEnd}
    onDragOver={onDragOver}
    onDrop={() => onDrop(product)}
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
            onClick={() => onMoveUp(product, index)}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Up"
          >
            <IoArrowUp size={12} />
          </button>
          <button
            onClick={() => onMoveDown(product, index)}
            disabled={index === totalItems - 1}
            className="p-1 text-gray-400 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Down"
          >
            <IoArrowDown size={12} />
          </button>
        </div>
      </div>
    </td>
    <td className="p-3">{product.tourName}</td>
    <td className="p-3">
      <img
        src={`${import.meta.env.VITE_BACKEND_URL}${product.thumbImage}`}
        alt={product.tourName}
        className="w-12 h-12 rounded-md object-cover"
      />
    </td>
    <td className="p-3">{product.tourOrder}</td>
    <td className="p-3">
      <span
        className={`px-2 py-1 rounded-full text-sm ${
          product.productStatus === "Yes"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {product.productStatus}
      </span>
    </td>
    <td className="p-3">
      <span
        className={`px-2 py-1 rounded-full text-sm ${
          product.tourPasswordEnabled
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {product.tourPasswordEnabled ? "Protected" : "Open"}
      </span>
    </td>
    <td className="p-3">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(product)}
          className="p-2 bg-accent-400 text-white rounded hover:bg-accent-600 transition duration-300"
          title="Edit"
        >
          <HiOutlinePencil size={16} />
        </button>
        <button
          onClick={() => onDelete(product._id)}
          className="p-2 bg-error-200 text-white rounded hover:bg-red-700 transition duration-300"
          title="Delete"
        >
          <HiOutlineTrash size={16} />
        </button>
        <button
          onClick={() => onSetPassword(product)}
          className="p-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition duration-300"
          title={product.tourPasswordEnabled ? "Update Password" : "Set Password"}
        >
          <HiOutlineKey size={16} />
        </button>
        <button
          onClick={() => onViewAnalytics(product)}
          className={`p-2 rounded transition duration-300 ${
            hasAnalyticsId
              ? "bg-amber-100 text-gray-900 hover:bg-amber-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title={hasAnalyticsId ? "View Analytics" : "Analytics ID not set"}
          disabled={!hasAnalyticsId}
        >
          <MdOutlineAnalytics size={16} />
        </button>
      </div>
    </td>
  </tr>
  );
};

const ProductTable = () => {
  const { token } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Simple state management for client-side search
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState('tourOrder');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Store all products and filtered results
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkUpdateUrl, setBulkUpdateUrl] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordProduct, setPasswordProduct] = useState(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsProduct, setAnalyticsProduct] = useState(null);
  
  // Drag and drop states
  const [draggedProduct, setDraggedProduct] = useState(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Load categories once when component mounts
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const response = await fetchCategories(token);
        console.log('Categories response:', response);
        
        // Extract categories array from response properly
        const categoriesArray = response?.categories || 
                              (Array.isArray(response) ? response : []);
                              
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]); // Set to empty array on error
      }
    };
    
    if (token) {
      fetchCategoriesData();
    }
  }, [token]);

  // Load all products once when component mounts
  useEffect(() => {
    if (token) {
      loadAllProducts();
    }
  }, [token]);

  // Filter products whenever search query changes
  useEffect(() => {
    filterProducts();
  }, [searchQuery, allProducts]);

  // Update pagination when filtered products change
  useEffect(() => {
    updatePagination();
  }, [filteredProducts, page, limit]);

  const loadAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load ALL products without pagination for client-side filtering
      const options = {
        page: 1,
        limit: 1000, // Load a large number to get all products
        sort: sortField,
        order: sortOrder,
        filters: { categoryType: "Virtual Tour" }
      };
      
      const response = await fetchProducts(token, options);
      
      if (response && response.success) {
        setAllProducts(response.products || []);
        setFilteredProducts(response.products || []);
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please try again later.');
      setAllProducts([]);
      setFilteredProducts([]);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search query (client-side)
  const filterProducts = () => {
    if (!searchQuery || searchQuery.trim() === '') {
      setFilteredProducts(allProducts);
      return;
    }

    const filtered = allProducts.filter(product => 
      product.tourName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productStatus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tourOrder?.toString().includes(searchQuery)
    );
    
    setFilteredProducts(filtered);
    setPage(1); // Reset to first page when filtering
  };

  // Update pagination based on filtered products
  const updatePagination = () => {
    const total = filteredProducts.length;
    setTotalItems(total);
    setTotalPages(Math.ceil(total / limit));
  };

  // Get products for current page
  const getCurrentPageProducts = () => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete, token);
      toast.success("Product deleted successfully");
      setIsModalOpen(false);
      setProductToDelete(null);
      // Reload all products after deletion
      loadAllProducts();
    } catch (error) {
      toast.error("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

  // Handle live search (client-side filtering)
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Filtering happens automatically via useEffect
  };

  // Removed category filter change handler

  const handleEdit = (product) => {
    setIsEditing(true);
    setProductToEdit(product);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProductToEdit(null);
  };

  const handleUpdateProduct = async () => {
    setIsEditing(false);
    setProductToEdit(null);
    await loadAllProducts();
    toast.success("Product updated successfully");
  };

  const handleBulkUpdateTourURLs = async () => {
    if (!bulkUpdateUrl.trim()) {
      toast.error('Please enter the base URL to remove');
      return;
    }

    setIsBulkUpdating(true);
    try {
      const result = await bulkUpdateTourURLs(token, bulkUpdateUrl.trim());
      console.log('Bulk update result:', result);
      
      // Reload products to show updated data
      await loadProducts();
      
      // Close modal and reset state
      setShowBulkUpdateModal(false);
      setBulkUpdateUrl('');
      
    } catch (error) {
      console.error('Bulk update error:', error);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleOpenPasswordModal = (product) => {
    setPasswordProduct(product);
    setPasswordValue('');
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordProduct(null);
    setPasswordValue('');
    setIsPasswordUpdating(false);
  };

  const handleSubmitPassword = async (event) => {
    event?.preventDefault?.();

    if (!passwordProduct || !token) {
      return;
    }

    try {
      setIsPasswordUpdating(true);
      await updateProductPassword(passwordProduct._id, passwordValue, token);
      await loadAllProducts();
      handleClosePasswordModal();
    } catch (error) {
      console.error('Failed to update password:', error);
      setIsPasswordUpdating(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top of page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenAnalyticsModal = (product) => {
    setAnalyticsProduct(product);
    setShowAnalyticsModal(true);
  };

  const handleCloseAnalyticsModal = () => {
    setShowAnalyticsModal(false);
    setAnalyticsProduct(null);
  };

  const handleLaunchAnalytics = () => {
    if (!analyticsProduct?.googleAnalyticsId) return;

    const analyticsValue = analyticsProduct.googleAnalyticsId.trim();
    const isUrl = /^https?:\/\//i.test(analyticsValue);
    const targetUrl = isUrl
      ? analyticsValue
      : `https://analytics.google.com/analytics/web/#/p/${encodeURIComponent(analyticsValue)}/report-home`;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Drag and drop handlers
  const handleDragStart = (product) => {
    setDraggedProduct(product);
  };

  const handleDragEnd = () => {
    setDraggedProduct(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetProduct) => {
    if (!draggedProduct || draggedProduct._id === targetProduct._id) {
      return;
    }

    setIsUpdatingOrder(true);
    
    // Optimistic update - swap orders in local state immediately
    const draggedOrder = draggedProduct.tourOrder;
    const targetOrder = targetProduct.tourOrder;
    
    const updatedProducts = allProducts.map(product => {
      if (product._id === draggedProduct._id) {
        return { ...product, tourOrder: targetOrder };
      }
      if (product._id === targetProduct._id) {
        return { ...product, tourOrder: draggedOrder };
      }
      return product;
    }).sort((a, b) => a.tourOrder - b.tourOrder);
    
    // Update local state immediately (no flash)
    setAllProducts(updatedProducts);
    setDraggedProduct(null);
    
    try {
      // Update server in background
      await updateProductOrder(draggedProduct._id, targetOrder, token);
      await updateProductOrder(targetProduct._id, draggedOrder, token);
      toast.success("Product order updated successfully");
    } catch (error) {
      console.error('Error updating product order:', error);
      toast.error("Failed to update product order");
      // Revert on error
      await loadAllProducts();
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Reorder handlers
  const handleMoveUp = async (product, index) => {
    if (index === 0) return;
    
    const currentPageProducts = getCurrentPageProducts();
    const targetProduct = currentPageProducts[index - 1];
    
    // Optimistic update - swap orders in local state immediately
    const productOrder = product.tourOrder;
    const targetOrder = targetProduct.tourOrder;
    
    const updatedProducts = allProducts.map(p => {
      if (p._id === product._id) {
        return { ...p, tourOrder: targetOrder };
      }
      if (p._id === targetProduct._id) {
        return { ...p, tourOrder: productOrder };
      }
      return p;
    }).sort((a, b) => a.tourOrder - b.tourOrder);
    
    // Update local state immediately (no flash)
    setAllProducts(updatedProducts);
    
    try {
      // Update server in background
      await updateProductOrder(product._id, targetOrder, token);
      await updateProductOrder(targetProduct._id, productOrder, token);
      toast.success("Product moved up successfully");
    } catch (error) {
      console.error('Error moving product up:', error);
      toast.error("Failed to move product");
      // Revert on error
      await loadAllProducts();
    }
  };

  const handleMoveDown = async (product, index) => {
    const currentPageProducts = getCurrentPageProducts();
    if (index === currentPageProducts.length - 1) return;
    
    const targetProduct = currentPageProducts[index + 1];
    
    // Optimistic update - swap orders in local state immediately
    const productOrder = product.tourOrder;
    const targetOrder = targetProduct.tourOrder;
    
    const updatedProducts = allProducts.map(p => {
      if (p._id === product._id) {
        return { ...p, tourOrder: targetOrder };
      }
      if (p._id === targetProduct._id) {
        return { ...p, tourOrder: productOrder };
      }
      return p;
    }).sort((a, b) => a.tourOrder - b.tourOrder);
    
    // Update local state immediately (no flash)
    setAllProducts(updatedProducts);
    
    try {
      // Update server in background
      await updateProductOrder(product._id, targetOrder, token);
      await updateProductOrder(targetProduct._id, productOrder, token);
      toast.success("Product moved down successfully");
    } catch (error) {
      console.error('Error moving product down:', error);
      toast.error("Failed to move product");
      // Revert on error
      await loadAllProducts();
    }
  };
  
  return (
    <div className="max-w-sm md:max-w-[92%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Projects</h2>
        {isUpdatingOrder && (
          <span className="text-sm text-blue-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Updating order...
          </span>
        )}
      </div>
      
      {!isEditing && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex flex-1">
            <div className="relative flex-grow">
              <IoSearchOutline className="absolute left-3 top-3 text-accent-600" />
              <input
                type="text"
                placeholder="Search products..."
                aria-label="Search products"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 pl-10 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1); // Reset to first page when changing page size
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
          
          {/* Page Jump Dropdown */}
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
      )}
      
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-accent-600">Loading products...</p>
        </div>
      )}
      
      {!isLoading && error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={loadProducts}
            className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
            Try Again
          </button>
        </div>
      )}
      
      {isEditing ? (
        <AddProduct
          isEditing={isEditing}
          productToEdit={productToEdit}
          onCancel={handleCancelEdit}
          onUpdate={handleUpdateProduct}
        />
      ) : (
        <>
          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-accent-600">No products found</p>
            </div>
          )}
          
          {!isLoading && !error && getCurrentPageProducts().length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary-400 text-white">
                      <th className="p-3 text-left w-16">Order</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Image</th>
                      <th className="p-3 text-left">Order #</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Password</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageProducts().map((product, index) => {
                      const currentPageProducts = getCurrentPageProducts();
                      return (
                      <ProductRow
                        key={product._id}
                        product={product}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onSetPassword={handleOpenPasswordModal}
                        onViewAnalytics={handleOpenAnalyticsModal}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        index={index}
                        totalItems={currentPageProducts.length}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        isDragging={draggedProduct?._id === product._id}
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
        </>
      )}
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleDelete(productToDelete);
          setIsModalOpen(false);
        }}
        message="Are you sure you want to delete this product?"
        action="Delete"
      />
      
      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Bulk Update Tour URLs</h3>
            <p className="text-gray-600 mb-4">
              Enter the base URL to remove from all product Tour URLs. Only the path (like /gallery...) will remain.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL to Remove:
              </label>
              <input
                type="text"
                value={bulkUpdateUrl}
                onChange={(e) => setBulkUpdateUrl(e.target.value)}
                placeholder="e.g., https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBulkUpdateModal(false);
                  setBulkUpdateUrl('');
                }}
                disabled={isBulkUpdating}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdateTourURLs}
                disabled={isBulkUpdating || !bulkUpdateUrl.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isBulkUpdating ? 'Updating...' : 'Update All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {passwordProduct?.tourPasswordEnabled ? 'Update Tour Password' : 'Set Tour Password'}
            </h3>
            <p className="text-gray-600 mb-4">
              {passwordProduct?.tourPasswordEnabled
                ? 'Enter a new password to replace the existing one. Leave blank and submit to remove protection.'
                : 'Set a password to protect this tour. Leave blank to keep it open.'}
            </p>
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tour-password-input">
                  Password
                </label>
                <input
                  id="tour-password-input"
                  type="text"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder={passwordProduct?.tourPasswordEnabled ? 'Leave blank to remove' : 'Enter password'}
                  className="w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isPasswordUpdating}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  disabled={isPasswordUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition disabled:opacity-60"
                  disabled={isPasswordUpdating}
                >
                  {isPasswordUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tour Analytics</h3>
              <button
                onClick={handleCloseAnalyticsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {analyticsProduct?.googleAnalyticsId ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Measurement / Property ID</p>
                  <p className="text-base font-medium break-all">{analyticsProduct.googleAnalyticsId}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                  Ensure this measurement ID is linked to the virtual tour domain inside Google Analytics.
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleLaunchAnalytics}
                    className="w-full px-4 py-2 rounded-md border border-amber-300 bg-amber-100 text-gray-900 hover:bg-amber-200 transition font-medium"
                  >
                    Open Analytics Dashboard in New Tab
                  </button>
                  <p className="px-3 py-2 text-xs text-amber-900 bg-amber-100 rounded-md">
                    The dashboard opens in a new browser tab. Make sure pop-ups are allowed for Google Analytics if nothing appears.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCloseAnalyticsModal}
                      className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-700">
                  This tour does not have a Google Analytics ID configured yet. Edit the tour and set an ID to start tracking.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleCloseAnalyticsModal}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
