import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { fetchAlbums } from "../../services/albumService";
import { createImage } from "../../services/imageService";
import logo2 from "../../assets/images/360eye_logo 4.png";

const AddImage = () => {
  const { token } = useSelector((state) => state.auth);
  const [albumNames, setAlbumNames] = useState([]);
  const [formData, setFormData] = useState({
    albumName: "",
    imageStatus: "",
    imageOrder: "",
    thumbPhoto: null,
    tabletPhoto: null,
    desktopPhoto: null,
    mobilePhoto: null,
    imageDescription: "",
  });

  // Fetch all albums and extract album names
  useEffect(() => {
    const loadAlbumNames = async () => {
      try {
        const response = await fetchAlbums(token);
        const albums = response.albums;
        setAlbumNames(albums); // Store the entire album objects (with _id and albumName)
        // console.log(albums);
      } catch (error) {
        console.error("Error loading album names:", error);
      }
    };

    loadAlbumNames();
  }, [token]);


  // Dropzone handlers for each photo type
  const { getRootProps: getThumbRootProps, getInputProps: getThumbInputProps } =
    useDropzone({
      accept: "image/*",
      onDrop: (acceptedFiles) => {
        setFormData((prevData) => ({
          ...prevData,
          thumbPhoto: acceptedFiles[0],
        }));
      },
    });

  const {
    getRootProps: getTabletRootProps,
    getInputProps: getTabletInputProps,
  } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prevData) => ({
        ...prevData,
        tabletPhoto: acceptedFiles[0],
      }));
    },
  });

  const {
    getRootProps: getDesktopRootProps,
    getInputProps: getDesktopInputProps,
  } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prevData) => ({
        ...prevData,
        desktopPhoto: acceptedFiles[0],
      }));
    },
  });

  const {
    getRootProps: getMobileRootProps,
    getInputProps: getMobileInputProps,
  } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFormData((prevData) => ({
        ...prevData,
        mobilePhoto: acceptedFiles[0],
      }));
    },
  });

  // Handle form input changes
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleOnSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object for file uploads
    const data = new FormData();
    data.append("albumName", formData.albumName);
    data.append("imageStatus", formData.imageStatus);
    data.append("imageOrder", formData.imageOrder);
    data.append("imageDescription", formData.imageDescription);

    // Append files (if they exist)
    if (formData.thumbPhoto) {
      data.append("thumbPhoto", formData.thumbPhoto);
    }
    if (formData.tabletPhoto) {
      data.append("tabletPhoto", formData.tabletPhoto);
    }
    if (formData.desktopPhoto) {
      data.append("desktopPhoto", formData.desktopPhoto);
    }
    if (formData.mobilePhoto) {
      data.append("mobilePhoto", formData.mobilePhoto);
    }

    //     // Log FormData to check if fields are being appended correctly
    // for (let [key, value] of data.entries()) {
    //   console.log(key, value);
    // }


    try {
      await createImage(data, token);
      handleReset(); // Reset form after successful submission
    } catch (error) {
      console.error("Error submitting image:", error);
    }
  };

  // Reset form fields
  const handleReset = () => {
    setFormData({
      albumName: "",
      imageStatus: "",
      imageOrder: "",
      thumbPhoto: null,
      tabletPhoto: null,
      desktopPhoto: null,
      mobilePhoto: null,
      imageDescription: "",
    });
  };

  return (
    <>
      {/* Main Content */}
      <div>
        <img src={logo2} alt="logo" className="absolute right-9 top-6" />
        <h1 className="text-2xl font-bold p-5"></h1>

        {/* Card Container */}
        <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10">
          <h2 className="text-xl font-semibold mb-6">Add Image</h2>

          {/* Form */}
          <form onSubmit={handleOnSubmit} className="space-y-6">
            {/* Grid Container for Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Album Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Album Name
                </label>
                <select
                  name="albumName"
                  value={formData.albumName}
                  onChange={handleOnChange}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Album Name</option>
                  {albumNames.map((album, index) => (
                    <option key={index} value={album?._id}>
                      {album.albumName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image Status
                </label>
                <select
                  name="imageStatus"
                  value={formData.imageStatus}
                  onChange={handleOnChange}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Image Status</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Image Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image Order
                </label>
                <input
                  type="number"
                  name="imageOrder"
                  value={formData.imageOrder}
                  onChange={handleOnChange}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter image order"
                  required
                />
              </div>

              {/* Thumb Photo Dropzone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Thumb Photo
                </label>
                <div
                  {...getThumbRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
                >
                  <input {...getThumbInputProps()} />
                  {formData.thumbPhoto ? (
                    <img
                      src={URL.createObjectURL(formData.thumbPhoto)}
                      alt="Thumbnail"
                      className="max-h-32"
                    />
                  ) : (
                    <p className="text-gray-500 flex justify-center mt-[5%]">
                      Drag & drop an image here, or click to select one
                    </p>
                  )}
                </div>
              </div>

              {/* Tablet Photo Dropzone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tablet Photo
                </label>
                <div
                  {...getTabletRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
                >
                  <input {...getTabletInputProps()} />
                  {formData.tabletPhoto ? (
                    <img
                      src={URL.createObjectURL(formData.tabletPhoto)}
                      alt="Tablet"
                      className="max-h-32"
                    />
                  ) : (
                    <p className="text-gray-500 flex justify-center mt-[5%]">
                      Drag & drop an image here, or click to select one
                    </p>
                  )}
                </div>
              </div>

              {/* Desktop Photo Dropzone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Desktop Photo
                </label>
                <div
                  {...getDesktopRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
                >
                  <input {...getDesktopInputProps()} />
                  {formData.desktopPhoto ? (
                    <img
                      src={URL.createObjectURL(formData.desktopPhoto)}
                      alt="Desktop"
                      className="max-h-32"
                    />
                  ) : (
                    <p className="text-gray-500 flex justify-center mt-[5%]">
                      Drag & drop an image here, or click to select one
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile Photo Dropzone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Photo
                </label>
                <div
                  {...getMobileRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-12 border-2 border-accent-300 border-dashed rounded-md"
                >
                  <input {...getMobileInputProps()} />
                  {formData.mobilePhoto ? (
                    <img
                      src={URL.createObjectURL(formData.mobilePhoto)}
                      alt="Mobile"
                      className="max-h-32"
                    />
                  ) : (
                    <p className="text-gray-500 flex justify-center mt-[5%]">
                      Drag & drop an image here, or click to select one
                    </p>
                  )}
                </div>
              </div>

              {/* Image Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Image Description
                </label>
                <textarea
                  name="imageDescription"
                  value={formData.imageDescription}
                  onChange={handleOnChange}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter image description"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 w-[40%]">
              <button
                type="submit"
                className="w-full bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-info-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddImage;