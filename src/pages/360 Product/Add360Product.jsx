import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { create360Product, update360Product } from "../../services/product360service";
import logo2 from "../../assets/images/360eye_logo 4.png";

const Add360Product = ({ isEditing }) => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams(); // Get the product ID from the URL
  const location = useLocation(); // Access the location object
  const productToEdit = location.state?.product; // Get the product data from state
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    thumbImage: null,
    virtualTourLink: "",
    productStatus: "",
    tourOrder: "",
  });

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
    if (isEditing && productToEdit) {
      // Prefill the form if in edit mode and product data is available
      setFormData({
        name: productToEdit.name || "",
        thumbImage: productToEdit.thumbImage || null,
        virtualTourLink: productToEdit.virtualTourLink || "",
        productStatus: productToEdit.productStatus || "",
        tourOrder: productToEdit.tourOrder || "",
      });
    } else {
      // Reset form data if not in edit mode
      setFormData({
        name: "",
        thumbImage: null,
        virtualTourLink: "",
        productStatus: "",
        tourOrder: "",
      });
    }
  }, [isEditing, productToEdit]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (isEditing && id) {
        await update360Product(id, formDataToSend, token);
      } else {
        await create360Product(formDataToSend, token);
      }
      
      navigate("/360products/all"); // Redirect to the 360 products page
    } catch (error) {
      console.error("Error submitting 360 product:", error);
    }
  };

  return (
    <div>
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />
      <h1 className="text-2xl font-bold p-5"></h1>

      <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10">
        <h2 className="text-xl font-semibold mb-6">
          {isEditing ? "Edit 360 Product" : "Add 360 Product"}
        </h2>

        <form onSubmit={handleOnSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO-Page Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SEO-Page Title (compulsory)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter SEO page title"
                required
              />
            </div>

            {/* Virtual Tour Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Virtual Tour Link
              </label>
              <input
                type="url"
                name="virtualTourLink"
                value={formData.virtualTourLink}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter virtual tour link"
                required
              />
            </div>

            {/* Product Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Status
              </label>
              <select
                name="productStatus"
                value={formData.productStatus}
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select Product Status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
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

            {/* Thumb Image Dropzone */}
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
                      src={`${import.meta.env.VITE_BACKEND_URL}${formData.thumbImage}`}
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
              onClick={() => navigate("/360products/all")}
              className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add360Product;