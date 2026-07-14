// AddPropertyStatus.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  createPropertyStatus,
  updatePropertyStatus,
} from "../../services/propertyStatusService";
import ReusableForm from "../ReusableForm";

const AddPropertyStatus = ({
  isEditing,
  currentPropertyStatus,
  onCancelEdit,
  onSuccess,
}) => {
  const { token } = useSelector((state) => state.auth);
  const [initialState, setInitialState] = useState({
    propertyStatusName: "",
    propertyStatusPhoto: "",
    status: "",
    orderNo: "",
  });

  // Prepopulate the form when editing
  useEffect(() => {
    if (isEditing && currentPropertyStatus) {
      setInitialState({
        propertyStatusName: currentPropertyStatus.propertyStatusName || "",
        propertyStatusPhoto:
          currentPropertyStatus.propertyStatusPhoto?.replace(/\/+/g, "/") || "",
        status: currentPropertyStatus.status ? "Yes" : "No",
        orderNo: currentPropertyStatus.orderNo || "",
      });
    } else {
      setInitialState({
        propertyStatusName: "",
        propertyStatusPhoto: "",
        status: "",
        orderNo: "",
      });
    }
  }, [isEditing, currentPropertyStatus]);

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing, currentPropertyStatus]);

  const handleOnSubmit = async (e, formData, handleReset) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Append all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === "propertyStatusPhoto" && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (
          key === "propertyStatusPhoto" &&
          typeof formData[key] === "string"
        ) {
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
      if (isEditing && currentPropertyStatus) {
        response = await updatePropertyStatus(
          currentPropertyStatus._id,
          formDataToSend,
          token
        );
      } else {
        response = await createPropertyStatus(formDataToSend, token);
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
    propertyStatusName: "Property Status Name",
    propertyStatusPhoto: "Property Status Photo",
    status: "Status",
    orderNo: "Order Number",
  };

  const placeholders = {
    propertyStatusName: "Enter property status name",
    propertyStatusPhoto: "Upload property status photo",
    status: "Select status",
    orderNo: "Enter order number",
  };

  return (
    <ReusableForm
      formTitle={isEditing ? "Edit Property Status" : "Add Property Status"}
      initialState={initialState}
      onSubmit={handleOnSubmit}
      isEditing={isEditing}
      onCancelEdit={onCancelEdit}
      labels={labels}
      placeholders={placeholders}
    />
  );
};

export default AddPropertyStatus;
