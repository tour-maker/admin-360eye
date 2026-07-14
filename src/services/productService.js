import axios from "axios";
import toast from "react-hot-toast";
import { joinUrl } from "../utils/urlUtils";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance with headers
const api = axios.create({
  baseURL: joinUrl(API_URL, 'admin/products'),
});

// Fetch all products with pagination and filtering
export const fetchProducts = async (token, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = 'tourOrder',
      order = 'asc',
      filters = {}
    } = options;

    // Build API parameters
    const params = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      order,
      ...filters
    };

    // Add search parameter if present
    if (search && search.trim() !== '') {
      params.search = search;
    }

    console.log("Fetching products with params:", params);

    const response = await api.get("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch products");
    }

    // Normalize response according to API structure
    return {
      success: true,
      products: response.data.products || [],
      pagination: response.data.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        totalProducts: response.data.totalItems || response.data.totalProducts || 0,
        totalPages: response.data.totalPages || Math.ceil((response.data.totalItems || 0) / limit),
        hasNextPage: page < (response.data.totalPages || Math.ceil((response.data.totalItems || 0) / limit)),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    throw error;
  }
};

// Create a new product with image upload
export const createProduct = async (formData, token) => {
  try {
    const response = await api.post("", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product created successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error creating product"); // Display error notification using toast
    console.error("Error creating product:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
  
};

// Update a product
export const updateProduct = async (id, formData, token, navigate = null) => {
  try {
    if (!id) {
      throw new Error('Product ID is required for update');
    }
    
    const response = await api.put(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product updated successfully"); // Display success notification using toast
    
    // Only navigate if navigate function is provided (for traditional editing)
    if (navigate) {
      navigate("/"); // Redirect to products page
    }
    
    return response.data;
  } catch (error) {
    toast.error("Error updating product"); // Display error notification using toast
    console.error("Error updating product:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete a product
export const deleteProduct = async (id, token) => {
  try {
    const response = await api.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting product"); // Display error notification using toast
    console.error("Error deleting product:", error); // Log error for debugging
    throw error; // Re-throw the error if needed
  }
};

// Delete product thumbnail image
export const deleteProductThumbnail = async (id, token) => {
  try {
    const response = await api.delete(`/photo/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product thumbnail deleted successfully"); // Display success notification using toast
    console.log(response);
    return response.data;
  } catch (error) {
    toast.error("Error deleting product thumbnail"); // Display error notification using toast
    throw error; // Re-throw the error if needed
  }
};

// Fetch products by category
export const fetchProductsByCategory = async (category, token, categoryType, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = 'tourOrder',
      order = 'asc'
    } = options;

    // Build API parameters
    const params = {
      category,
      categoryType,
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      order
    };

    // Add search parameter if present
    if (search && search.trim() !== '') {
      params.search = search;
    }

    console.log("Fetching products by category with params:", params);

    const response = await api.get(`/category`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // Normalize response according to API structure
    return {
      success: true,
      products: response.data.products || [],
      pagination: response.data.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        totalProducts: response.data.totalItems || response.data.totalProducts || 0,
        totalPages: response.data.totalPages || Math.ceil((response.data.totalItems || 0) / limit),
        hasNextPage: page < (response.data.totalPages || Math.ceil((response.data.totalItems || 0) / limit)),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      toast('No Product Found for this category!', {
        icon: '🔍',
      });
    } 
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

// Bulk update all products to remove base URL from Tour URLs
export const bulkUpdateTourURLs = async (token, baseUrlToRemove) => {
  try {
    console.log('Starting bulk update of Tour URLs...');
    
    // First, fetch all products
    const allProductsResponse = await fetchProducts(token, { limit: 1000 }); // Get a large number
    
    if (!allProductsResponse.success) {
      throw new Error('Failed to fetch products for bulk update');
    }
    
    const products = allProductsResponse.products;
    console.log(`Found ${products.length} products to update`);
    
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each product
    for (const product of products) {
      try {
        if (product.tourURL && product.tourURL.includes(baseUrlToRemove)) {
          // Remove the base URL and keep only the path
          const newTourURL = product.tourURL.replace(baseUrlToRemove, '');
          
          // Ensure it starts with /
          const cleanTourURL = newTourURL.startsWith('/') ? newTourURL : '/' + newTourURL;
          
          console.log(`Updating product ${product._id}: ${product.tourURL} -> ${cleanTourURL}`);
          
          // Create form data with updated tourURL
          const formData = new FormData();
          formData.append('categoryType', product.categoryType || 'Virtual Tour');
          formData.append('propertyType', product.propertyType || '');
          formData.append('propertyStatus', product.propertyStatus || '');
          formData.append('productStatus', product.productStatus || '');
          formData.append('productLocation', product.productLocation || '');
          formData.append('productSmallDetail', product.productSmallDetail || '');
          formData.append('tourName', product.tourName || '');
          formData.append('tourURL', cleanTourURL);
          formData.append('tourOrder', product.tourOrder || '');
          formData.append('urlName', product.urlName || '');
          formData.append('area', product.area || '');
          
          // Update the product (without navigation)
          await updateProduct(product._id, formData, token);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
        errorCount++;
        errors.push({ productId: product._id, error: error.message });
      }
    }
    
    const result = {
      success: true,
      totalProducts: products.length,
      updatedCount,
      errorCount,
      errors
    };
    
    console.log('Bulk update completed:', result);
    
    if (updatedCount > 0) {
      toast.success(`Successfully updated ${updatedCount} product Tour URLs`);
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} products. Check console for details.`);
    }
    
    return result;
  } catch (error) {
    console.error('Bulk update failed:', error);
    toast.error('Bulk update failed: ' + error.message);
    throw error;
  }
};

export const updateProductPassword = async (id, password, token) => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }

    const payload = {
      password: typeof password === 'string' ? password : '',
    };

    const response = await api.put(`/${id}/password`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update password');
    }

    toast.success(response.data.message || 'Password updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating product password:', error);
    toast.error(error.response?.data?.message || 'Failed to update password');
    throw error;
  }
};

export const updateProductOrder = async (id, tourOrder, token) => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Create FormData to update just the tourOrder
    const formData = new FormData();
    formData.append('tourOrder', parseInt(tourOrder));

    const response = await api.put(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update product order');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating product order:', error);
    throw error;
  }
};