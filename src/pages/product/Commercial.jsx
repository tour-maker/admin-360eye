import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createProduct, updateProduct } from "../../services/productService";
import { fetchCategories } from "../../services/categoryService";
import { fetchPropertyTypes } from "../../services/propertyTypeService";
import { fetchPropertyStatuses } from "../../services/propertyStatusService";
import { fetchAreas } from "../../services/areaService";

const AddCommercial = ({ isEditing }) => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams(); // Get the product ID from the URL
  const location = useLocation(); // Access the location object
  const productToEdit = location.state?.product; // Get the product data from state

  const [formData, setFormData] = useState({
    categoryType: "Playlist", // Set default value here
    propertyType: "", // Required by API but hidden
    propertyStatus: "", // Required by API but hidden
    productStatus: "",
    productLocation: "Commercial", // Required by API but hidden
    productSmallDetail: "",
    tourName: "Commercial Film", // Required by API but hidden
    tourURL: "",
    tourOrder: "",
    urlName: "commercial-film", // Required by API but hidden
    area: "", // Required by API but hidden
    thumbImage: null,
  });

  const [categories, setCategories] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyStatuses, setPropertyStatuses] = useState([]);
  const [areas, setAreas] = useState([]);
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prevData) => ({
        ...prevData,
        thumbImage: acceptedFiles[0],
      }));
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

        if (isEditing && productToEdit) {
          setFormData({
            categoryType: "Playlist",
            propertyType: productToEdit.propertyType || propertyTypesData.propertyTypes[0]?._id || "",
            propertyStatus: productToEdit.propertyStatus || propertyStatusesData.propertyStatuses[0]?._id || "",
            productStatus: productToEdit.productStatus || "",
            productLocation: productToEdit.productLocation || "",
            productSmallDetail: productToEdit.productSmallDetail || "",
            tourName: productToEdit.tourName || "",
            tourURL: productToEdit.tourURL || "",
            tourOrder: productToEdit.tourOrder || "",
            urlName: productToEdit.urlName || "",
            area: productToEdit.area || areasData[0]?.area || "",
            thumbImage: productToEdit.thumbImage || null,
          });
        } else {
          setFormData(prev => ({
            ...prev,
            propertyType: propertyTypesData.propertyTypes[0]?._id || "",
            propertyStatus: propertyStatusesData.propertyStatuses[0]?._id || "",
            area: areasData[0]?.area || "",
          }));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    loadData();
  }, [token, isEditing, productToEdit]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    console.log("name", value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        await updateProduct(id, formData, token, navigate);
      } else {
        await createProduct(formData, token);
      }
      navigate("/managecommercial");
    } catch (error) {
      console.error("Error submitting product:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? "Edit Product" : "Add Product"}
      </h2>
      <form onSubmit={handleOnSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="hidden" name="categoryType" value="Playlist" />
        
        {/* Hidden fields required by API but not shown in UI */}
        <input type="hidden" name="propertyType" value={formData.propertyType} />
        <input type="hidden" name="propertyStatus" value={formData.propertyStatus} />
        <input type="hidden" name="productLocation" value={formData.productLocation} />
        <input type="hidden" name="urlName" value={formData.urlName} />
        <input type="hidden" name="area" value={formData.area} />
          {/* Title / Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title / Heading
            </label>
            <input
              type="text"
              name="tourName"
              value={formData.tourName}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
              placeholder="e.g. Project Location Video"
              required
            />
          </div>
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
              value="Playlist"
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter category type"
              required
            >
              <option value="">Select Category Type</option>
              <option value="Playlist">Playlist</option>
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

          {/* Product Small Detail */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Small Detail
            </label>
            <textarea
              name="productSmallDetail"
              value={formData.productSmallDetail}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter product small detail"
              required
            />
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
            onClick={() => navigate("/")} // Navigate back to the product table
            className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCommercial;