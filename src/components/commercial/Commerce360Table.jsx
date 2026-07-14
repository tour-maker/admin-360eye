import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../common/ConfirmationModal";
import { fetch360Products, delete360Product } from "../../services/product360service";
import Pagination from "../Pagination";
import { useNavigate } from "react-router-dom";

const Product360Table = () => {
    const { token } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadProducts();
    }, [page, limit, searchQuery, token]);

    const loadProducts = async () => {
        try {
            const data = await fetch360Products(token, { search: searchQuery, page, limit });

            if (data && data.products) {
                setProducts(data.products);
            } else {
                setProducts([]); // Set products to an empty array if no data is returned
            }
        } catch (error) {
            console.error("Error loading 360 products:", error);
            setProducts([]); // Set products to an empty array in case of an error
        }
    };

    const handleDeleteClick = (id) => {
        setProductToDelete(id);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            await delete360Product(productToDelete, token);

            // Check if the current page becomes empty after deletion
            if (paginatedProducts.length === 1 && page > 1) {
                setPage(page - 1); // Move to the previous page
            } else {
                await loadProducts(); // Reload products for the current page
            }
        } catch (error) {
            console.error("Error deleting 360 product:", error);
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleEdit = (product) => {
        navigate(`/360products/edit/${product._id}`, { state: { product } });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / limit);
    const paginatedProducts = filteredProducts.slice(
        (page - 1) * limit,
        page * limit
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
            <h2 className="text-xl font-semibold mb-6">Manage 360 Products</h2>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
                    <input
                        type="text"
                        placeholder="Search 360 products..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 pl-7 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

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
                        {paginatedProducts.map((product) => (
                            <tr
                                key={product._id}
                                className="border-b border-accent-300 hover:bg-secondary-100"
                            >
                                <td className="p-3">{product.name}</td>
                                <td className="p-3">
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}${product.thumbImage}`}
                                        alt={product.name}
                                        className="w-12 h-12 rounded-md object-cover"
                                    />
                                </td>
                                <td className="p-3">{product.tourOrder}</td>
                                <td className="p-3">
                                    
                                    <span
                                        className={`px-2 py-1 rounded-full text-sm ${product.productStatus === "Yes"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}>{product.productStatus}
                                    </span>
                                </td>
                                <td className="p-3 space-x-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(product._id)}
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

            <div className="flex justify-center mt-6">
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                message="Are you sure you want to delete this 360 product?"
                action="Delete"
            />
        </div>
    );
};

export default Product360Table;