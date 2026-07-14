import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createAlbum, updateAlbum } from "../../services/albumService";
import ReusableForm from "../ReusableForm";

const AddAlbum = ({ isEditing, currentAlbum, onCancelEdit, onSuccess }) => {
  const { token } = useSelector((state) => state.auth);
  const [initialState, setInitialState] = useState({
    albumName: "",
    albumDesc: "",
    albumPhoto: "",
    status: "",
    orderNo: "",
    albumType: "",
    albumExtraField: "",  // New field for additional input when albumType is "link" or "page"
  });

  // Prepopulate the form when editing
  useEffect(() => {
    if (isEditing && currentAlbum) {
      setInitialState({
        albumName: currentAlbum.albumName || "",
        albumDesc: currentAlbum.albumDesc || "",
        albumPhoto: currentAlbum.albumPhoto?.replace(/\/+/g, "/") || "",
        status: currentAlbum.status ? "Yes" : "No",
        orderNo: currentAlbum.orderNo || "",
        albumType: currentAlbum.albumType || "",
        albumExtraField: currentAlbum.albumExtraField || "", 
      });
    } else {
      setInitialState({
        albumName: "",
        albumDesc: "",
        albumPhoto: "",
        status: "", 
        albumType: "",
        albumExtraField: "", // Reset extra field
      });
    }
  }, [isEditing, currentAlbum]);

  const handleOnSubmit = async (e, formData, handleReset) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "albumPhoto" && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (key === "albumPhoto" && typeof formData[key] === "string") {
          // Don't append if it's an existing photo URL
        } else if (key === "status") {
          // Convert status to boolean
          formDataToSend.append(
            key,
            formData[key] === "Yes" ? "true" : "false"
          );
        } else {
          formDataToSend.append(key, formData[key]);
        } 
      });
      
      let response;
      if (isEditing && currentAlbum) {
        response = await updateAlbum(currentAlbum._id, formDataToSend, token);
      } else {
        response = await createAlbum(formDataToSend, token);
      }

      if (response.success) {
        onSuccess();
        if (isEditing) {
          onCancelEdit();
        } else {
          handleReset();
        }
      }
    } catch (error) {
      console.error("Error in handleOnSubmit:", error);
    }
  };

  const labels = {
    albumName: "Album Name",
    albumDesc: "Album Description",
    albumPhoto: "Album Photo",
    status: "Status",
    albumType: "albumType",
    orderNo: "Order No"
  };

  const placeholders = {
    albumName: "Enter album name",
    albumDesc: "Enter album description",
    albumPhoto: "Enter album photo",
    albumType: "Enter albumType",
    orderNo: "Enter album order no"
  };

  return (
    <ReusableForm
      formTitle={isEditing ? "Edit Album" : "Add Album"}
      initialState={initialState}
      onSubmit={handleOnSubmit}
      isEditing={isEditing}
      onCancelEdit={onCancelEdit}
      labels={labels}
      placeholders={placeholders}
    />
  );
};

export default AddAlbum;
