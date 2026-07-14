import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  fetchProducts,
  fetchProductsByCategory,
  deleteProduct,
} from "../../services/productService";
import Pagination from "../Pagination";
import AddProduct from "../../pages/product/AddProduct"; // Assuming you have an AddProduct component
import { fetchCategories } from "../../services/categoryService";
import { useNavigate } from "react-router-dom";

// Separate component for the table row
const ProductRow = ({ product, onEdit, onDelete }) => (
  <tr className="border-b border-accent-300 hover:bg-secondary-100">
    <td className="p-3">{product.tourName}</td>
    <td className="p-3">
      <img
        // src={product.thumbImage || "/api/placeholder/48/48"}
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
    <td className="p-3 space-x-2">
      <button
        onClick={() => onEdit(product)}
        className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(product._id)}
        className="bg-error-200 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
      >
        Delete
      </button>
    </td>
  </tr>
);

const CommerceTable = () => {
  const { token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  // Removed category dropdown state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  // Removed categories state
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [page, limit, searchQuery, token]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use fetchProducts with categoryType in filters object for proper server-side filtering
      const data = await fetchProducts(token, { 
        search: searchQuery, 
        page, 
        limit,
        filters: {
          categoryType: "Playlist"
        }
      });
      
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (error) {
      setError("Failed to load products. Please try again later.");
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id, token);
      await loadProducts();
    } catch (error) {
      setError("Failed to delete product. Please try again.");
      console.error("Error deleting product:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // Removed category change handler

  // const handleEdit = (product) => {
  //   setIsEditing(true);
  //   setProductToEdit(product);
    
  // };

  const handleEdit = (product) => {
    navigate(`/product/editcommercial/${product._id}`, { state: { product } });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProductToEdit(null);
  };

  // Removed categories loading effect

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      // Call your API to update the product here
      // await updateProduct(updatedProduct, token);
      await loadProducts();
      setIsEditing(false);
      setProductToEdit(null);
    } catch (error) {
      setError("Failed to update product. Please try again.");
      console.error("Error updating product:", error);
    }
  };

  // Remove client-side filtering since server handles search and filtering
  // Use products directly from server response
  const paginatedProducts = products;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination.totalPages || 1)) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-sm md:max-w-[92%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <h2 className="text-xl font-semibold mb-6">Manage Commercial Products</h2>

      <div className="mb-6">
        <div className="relative w-full">
          <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-7 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {isEditing ? (
        <AddProduct
          isEditing={isEditing}
          productToEdit={productToEdit}
          onCancel={handleCancelEdit}
          onUpdate={handleUpdateProduct}
        />
      ) : (
        <>
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg">Loading products...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary-400 text-white">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Order</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <ProductRow
                        key={product._id}
                        product={product}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No commercial products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </div>
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
    </div>
  );
};

export default CommerceTable;
