// ReusableForm.jsx
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";

const ReusableForm = ({
  formTitle,
  initialState,
  onSubmit,
  isEditing = false,
  onCancelEdit,
  labels = {},
  placeholders = {},
}) => {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    setFormData(initialState);
  }, [initialState]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prevData) => ({
        ...prevData,
        [Object.keys(initialState).find((key) => key.includes("Photo"))]:
          acceptedFiles[0],
      }));
    },
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData(initialState);
  };
  const renderImage = (photoUrl) => {
    if (!photoUrl) return null;

    if (photoUrl instanceof File) {
      return (
        <img
          src={URL.createObjectURL(photoUrl)}
          alt="Preview"
          className="max-h-32"
        />
      );
    }

    // Ensure we don't add the backend URL if it's already included
    const fullImageUrl = photoUrl.startsWith("http")
      ? photoUrl
      : `${import.meta.env.VITE_BACKEND_URL}${
          photoUrl.startsWith("/") ? "" : "/"
        }${photoUrl}`;

    // For existing images from the server
    return (
      <img
        src={fullImageUrl}
        alt="Category"
        className="max-h-32"
        onError={(e) => {
          console.error("Failed to load image:", fullImageUrl);
          // Don't set a new src to avoid infinite loop
          e.target.style.display = "none";
        }}
      />
    );
  };

  return (
    <div
      className={`w-[60%] mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10`}
    >
      <h2 className="text-xl font-semibold mb-6">{formTitle}</h2>
      <form
        onSubmit={(e) => onSubmit(e, formData, handleReset)}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          {Object.keys(initialState).map((key) =>
            key.includes("Photo") ? (
              <div key={key} className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {labels[key] || key.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <div
                  {...getRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
                >
                  <input {...getInputProps()} />
                  {formData[key] ? (
                    renderImage(formData[key])
                  ) : (
                    <p className="text-gray-500 flex justify-center mt-[5%]">
                      Drag & drop an image here, or click to select one
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // Rest of your form fields remain the same
              <div key={key}>
              {key !== "albumExtraField" && (
                <label className="block text-sm font-medium text-gray-700">
                  {labels[key] || key.replace(/([A-Z])/g, " $1").trim()}
                </label>
              )}
                {typeof formData[key] === "number" ||
                key.toLowerCase().includes("order") ? (
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleOnChange}
                    className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={placeholders[key]}
                    required
                  />
                ) : key === "status" ? (
                  <select
                    name={key}
                    value={formData[key]}
                    onChange={handleOnChange}
                    className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : 
                key === "albumType" ? (
                  <select
                    name={key}
                    value={formData[key]}
                    onChange={handleOnChange}
                    className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select albumType</option>
                    <option value="Gallery">Gallery</option>
                    <option value="Link">Link</option>
                    <option value="Page">Page</option>
                  </select>
                ): key === "albumExtraField" ? (
                  formData.albumType === "Link" || formData.albumType === "Page" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Extra Input (for Link/Page)
                      </label>
                      <input
                        type="text"
                        name="albumExtraField"  // Make sure the name matches the field in your backend
                        value={formData.albumExtraField || ""}
                        onChange={handleOnChange}
                        className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter details for link or page"
                      />
                    </div>
                  ) : null
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData[key]}
                    onChange={handleOnChange}
                    className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={placeholders[key]}
                    required
                  />
                )}
              </div>
            )
          )}
 
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
            onClick={isEditing ? onCancelEdit : handleReset}
            className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
          >
            {isEditing ? "Cancel" : "Reset"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReusableForm;
