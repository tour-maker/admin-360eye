import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { addSlider, updateSlider } from "../../services/sliderService";
import toast from "react-hot-toast";

const AddSlider = ({ isEditing }) => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();
  const location = useLocation();
  const sliderToEdit = location.state?.slider;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    sliderLink: "",
    sliderOrder: "",
    sliderStatus: "",
    clientLogo: null,
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prevData) => ({
        ...prevData,
        clientLogo: acceptedFiles[0],
      }));
    },
  });

  useEffect(() => {
    if (isEditing && sliderToEdit) {
      setFormData({
        title: sliderToEdit.title || "",
        sliderLink: sliderToEdit.sliderLink || "",
        sliderOrder: sliderToEdit.sliderOrder || "",
        sliderStatus: sliderToEdit.sliderStatus || "",
        clientLogo: sliderToEdit.clientLogo || null,
      });
    }
  }, [isEditing, sliderToEdit]);

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
      if (isEditing && id) {
        await updateSlider(id, formData, token);
      } else {
        await addSlider(formData, token);
      }
      navigate("/slider");
    } catch (error) {
      console.error("Error submitting client:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? "Edit Client" : "Add Client"}
      </h2>
      <form onSubmit={handleOnSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Link
            </label>
            <input
              type="url"
              name="sliderLink"
              value={formData.sliderLink}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter client link"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Order
            </label>
            <input
              type="number"
              name="sliderOrder"
              value={formData.sliderOrder}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter client order"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Status
            </label>
            <select
              name="sliderStatus"
              value={formData.sliderStatus}
              onChange={handleOnChange}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Client Status</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Client Logo
            </label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
            >
              <input {...getInputProps()} />
              {formData.clientLogo ? (
                typeof formData.clientLogo === "string" ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/uploads/sliders/${formData.clientLogo}`}
                    alt="Client Logo"
                    className="max-h-32"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(formData.clientLogo)}
                    alt="Client Logo"
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

        <div className="flex space-x-4 w-[40%]">
          <button
            type="submit"
            className="w-full bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300"
          >
            {isEditing ? "Update" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/slider")}
            className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSlider;
