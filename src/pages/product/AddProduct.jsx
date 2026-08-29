import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createProduct, updateProduct } from "../../services/productService";
import { fetchCategories } from "../../services/categoryService";
import { fetchPropertyTypes } from "../../services/propertyTypeService";
import { fetchPropertyStatuses } from "../../services/propertyStatusService";
import { fetchAreas } from "../../services/areaService"; // Import the area service
import toast from "react-hot-toast";

// Compress/resize an image client-side so uploads stay under CloudFront's 1MB body limit
const compressImage = (file, maxWidth = 1200, quality = 0.75) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AddProduct = ({ isEditing, productToEdit, onCancel, onUpdate }) => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams(); // Get the product ID from the URL
  const location = useLocation(); // Access the location object
  const productFromLocation = location.state?.product; // Get the product data from state
  
  // Use productToEdit prop if provided (for inline editing), otherwise use location state
  const productData = productToEdit || productFromLocation;

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryType: "Virtual Tour", // Set default value here
    propertyType: "",
    propertyStatus: "",
    productStatus: "",
    productLocation: "",
    productSmallDetail: "",
    tourName: "",
    tourURL: "",
    tourOrder: "",
    urlName: "",
    area: "",
    thumbImage: null,
    googleAnalyticsId: "",
    bhkType: [],
    plotStatus: "",
    hasVoiceOver: false,
    viewMode: "Day",
  });

  const [categories, setCategories] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyStatuses, setPropertyStatuses] = useState([]);
  const [areas, setAreas] = useState([]); // State for areas
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: async (acceptedFiles) => {
      try {
        const compressed = await compressImage(acceptedFiles[0]);
        setFormData((prevData) => ({
          ...prevData,
          thumbImage: compressed,
        }));
      } catch {
        setFormData((prevData) => ({
          ...prevData,
          thumbImage: acceptedFiles[0],
        }));
      }
    },
  });

 
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesData = await fetchCategories(token);
        const propertyTypesData = await fetchPropertyTypes(token);
        const propertyStatusesData = await fetchPropertyStatuses(token);
        const areasData = await fetchAreas(token);
        
        setCategories(categoriesData.categories);
        setPropertyTypes(propertyTypesData.propertyTypes);
        setPropertyStatuses(propertyStatusesData.propertyStatuses);
        setAreas(areasData);

        if (isEditing && productData) {
          setFormData({
            categoryType: "Virtual Tour",
            propertyType: productData.propertyType || "",
            propertyStatus: productData.propertyStatus || "",
            productStatus: productData.productStatus || "",
            productLocation: productData.productLocation || "",
            productSmallDetail: productData.productSmallDetail || "",
            tourName: productData.tourName || "",
            tourURL: productData.tourURL || "",
            tourOrder: productData.tourOrder || "",
            urlName: productData.urlName || "",
            area: productData.area || "",
            thumbImage: productData.thumbImage || null,
            googleAnalyticsId: productData.googleAnalyticsId || "",
            bhkType: Array.isArray(productData.bhkType)
              ? productData.bhkType
              : (productData.bhkType ? [productData.bhkType] : []),
            plotStatus: productData.plotStatus || "",
            hasVoiceOver: productData.hasVoiceOver || false,
            viewMode: productData.viewMode || "Day",
          });
        } else {
          setFormData({
            categoryType: "Virtual Tour",
            propertyType: "",
            propertyStatus: "",
            productStatus: "",
            productLocation: "",
            productSmallDetail: "",
            tourName: "",
            tourURL: "",
            tourOrder: "",
            urlName: "",
            area: "",
            thumbImage: null,
            googleAnalyticsId: "",
            bhkType: [],
            plotStatus: "",
            hasVoiceOver: false,
            viewMode: "Day",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [token, isEditing, productData]);

  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // If we have onUpdate prop (inline editing), use it
        if (onUpdate) {
          const productId = productData?._id || id;
          
          if (!productId) {
            console.error('No product ID found for update');
            toast.error('Error: Missing product ID. Cannot update product.');
            return;
          }
          
          await updateProduct(productId, formData, token);
          onUpdate(formData); // Call parent's update handler
        } else if (id) {
          // Traditional editing with navigation
          await updateProduct(id, formData, token, navigate);
          navigate("/");
        } else {
          console.error('No product ID available for editing');
          toast.error('Error: No product ID available for editing.');
        }
      } else {
        await createProduct(formData, token);
        navigate("/");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error('Error updating product: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? "Edit Project" : "Add Project"}
      </h2>
      <form onSubmit={handleOnSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="hidden" name="categoryType" value="Virtual Tour" />
          {/* Form fields */}
          {/* Main Category */}
          {/* <div> */}
            {/* <label className="block text-sm font-medium text-gray-700">
              Main Category
            </label>
            <select
              name="mainCategory"
              value={formData.mainCategory}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
              required
            >
              <option value="">Select Category</option>
              {categories?.map((category) => (
                <option key={category?._id} value={category?._id}>
                  {category?.categoryName}
                </option>
              ))}
            </select> */}
          {/* </div> */}
          {/* Category Type */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Category Type
            </label>
            <select
              type="text"
              name="categoryType"
              value="Virtual Tour"
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter category type"
              required
            >
              <option value="">Select Category Type</option>
              <option value="Virtual Tour">Virtual Tour</option>
              <option value="Playlist">Playlist</option>
            </select>
          </div> */}

          {/* Product Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Status
            </label>
            <select
              type="text"
              name="productStatus"
              value={formData.productStatus}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter product status"
              required
            >
              <option value="">Select Product Status</option>

              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* SEO : Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SEO : Tags (optional)
            </label>
            <input
              type="text"
              name="productLocation"
              value={formData.productLocation}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter SEO tags"
            />
          </div>

          {/* SEO : Page Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SEO : Page Description (optional)
            </label>
            <textarea
              name="productSmallDetail"
              value={formData.productSmallDetail}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter SEO page description"
            />
          </div>

          {/* SEO-Page Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Name (compulsory)
            </label>
            <input
              type="text"
              name="tourName"
              value={formData.tourName}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter Project name"
              required
            />
          </div>

          {/* Tag (BHK + Day/Night + Voice Over) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <button
              type="button"
              onClick={() => setIsTagModalOpen(true)}
              className="mt-1 block w-full text-left px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              {[
                ...formData.bhkType,
                ...(formData.viewMode === "Both" ? ["Day", "Night"] : formData.viewMode ? [formData.viewMode] : []),
                ...(formData.hasVoiceOver ? ["Voice Over"] : []),
              ].join(", ") || "Select tags"}
            </button>
            {isTagModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsTagModalOpen(false)}>
                <div className="bg-white rounded-md max-w-sm w-full border border-accent-300 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 border-b border-accent-300 flex justify-between items-center">
                    <h3 className="text-lg font-medium">Tag</h3>
                    <button type="button" onClick={() => setIsTagModalOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                  </div>
                  <div className="p-2 max-h-96 overflow-y-auto">
                    {["2 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5 BHK"].map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => {
                          setFormData((prevData) => {
                            const current = prevData.bhkType || [];
                            const updated = current.includes(option)
                              ? current.filter((v) => v !== option)
                              : [...current, option];
                            return { ...prevData, bhkType: updated };
                          });
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center justify-between ${formData.bhkType.includes(option) ? "text-primary-600 font-medium" : "text-gray-700"}`}
                      >
                        <span>{option}</span>
                        {formData.bhkType.includes(option) && <span>✓</span>}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prevData) => {
                          const hasDay = prevData.viewMode === "Day" || prevData.viewMode === "Both";
                          const hasNight = prevData.viewMode === "Night" || prevData.viewMode === "Both";
                          const newHasDay = !hasDay;
                          const newMode = newHasDay && hasNight ? "Both" : newHasDay ? "Day" : hasNight ? "Night" : "Day";
                          return { ...prevData, viewMode: newMode };
                        });
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center justify-between ${(formData.viewMode === "Day" || formData.viewMode === "Both") ? "text-primary-600 font-medium" : "text-gray-700"}`}
                    >
                      <span>Day</span>
                      {(formData.viewMode === "Day" || formData.viewMode === "Both") && <span>✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prevData) => {
                          const hasDay = prevData.viewMode === "Day" || prevData.viewMode === "Both";
                          const hasNight = prevData.viewMode === "Night" || prevData.viewMode === "Both";
                          const newHasNight = !hasNight;
                          const newMode = hasDay && newHasNight ? "Both" : hasDay ? "Day" : newHasNight ? "Night" : "Day";
                          return { ...prevData, viewMode: newMode };
                        });
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center justify-between ${(formData.viewMode === "Night" || formData.viewMode === "Both") ? "text-primary-600 font-medium" : "text-gray-700"}`}
                    >
                      <span>Night</span>
                      {(formData.viewMode === "Night" || formData.viewMode === "Both") && <span>✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prevData) => ({ ...prevData, hasVoiceOver: !prevData.hasVoiceOver }))}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center justify-between ${formData.hasVoiceOver ? "text-primary-600 font-medium" : "text-gray-700"}`}
                    >
                      <span>Voice Over</span>
                      {formData.hasVoiceOver && <span>✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prevData) => ({ ...prevData, plotStatus: prevData.plotStatus ? "" : "Yes" }))}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center justify-between ${formData.plotStatus ? "text-primary-600 font-medium" : "text-gray-700"}`}
                    >
                      <span>Plot Status</span>
                      {formData.plotStatus && <span>✓</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Tour URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tour URL
            </label>
            <input
              type="text"
              name="tourURL"
              value={formData.tourURL}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter tour URL"
              required
            />
          </div>

          {/* Google Analytics ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Google Analytics ID (optional)
            </label>
            <input
              type="text"
              name="googleAnalyticsId"
              value={formData.googleAnalyticsId}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., G-XXXXXXXXXX"
            />
          </div>

          {/* Tour Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tour Order
            </label>
            <input
              type="number"
              name="tourOrder"
              value={formData.tourOrder}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter tour order"
              required
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
             SEO-Page Title (compulsory)
            </label>
            <input
              type="text"
              name="urlName"
              value={formData.urlName}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter SEO page title"
              required
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Type
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="" className="text-black">
                Select Property Type
              </option>
              {propertyTypes.map((type) => (
                <option key={type._id} value={type._id} className="text-black">
                  {type.propertyName}
                </option>
              ))}
            </select>
          </div>

          {/* Property Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Status
            </label>
            <select
              name="propertyStatus"
              value={formData.propertyStatus}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Property Status</option>
              {propertyStatuses.map((status) => (
                <option key={status._id} value={status._id}>
                  {status.propertyStatusName}
                </option>
              ))}
            </select>
          </div>

          {/* Area Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Area
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Area</option>
              {areas.map((area) => (
                <option key={area._id} value={area.area}>
                  {area.area}
                </option>
              ))}
            </select>
          </div>

          {/* Other form fields... */}          {/* Thumb Image Dropzone */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Thumb Image
            </label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
            >
              <input {...getInputProps()} />
              {formData.thumbImage ? (
                typeof formData.thumbImage === "string" ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${formData.thumbImage
                      }`}
                    alt="Thumbnail"
                    className="max-h-32"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(formData.thumbImage)}
                    alt="Thumbnail"
                    className="max-h-32"
                  />
                )
              ) : (
                <p className="text-gray-500 flex justify-center mt-[5%]">
                  Drag & drop an image here, or click to select one
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 w-[40%]">
          <button
            type="submit"
            className="w-full bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300"
          >
            {isEditing ? "Update" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (onCancel) {
                onCancel(); // Use onCancel prop for inline editing
              } else {
                navigate("/"); // Navigate back to the product table for traditional editing
              }
            }}
            className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;