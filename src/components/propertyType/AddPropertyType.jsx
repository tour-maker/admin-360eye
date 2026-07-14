// AddPropertyType.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  createPropertyType,
  updatePropertyType,
} from "../../services/propertyTypeService";
import ReusableForm from "../ReusableForm";

const AddPropertyType = ({
  isEditing,
  currentPropertyType,
  onCancelEdit,
  onSuccess,
}) => {
  const { token } = useSelector((state) => state.auth);
  const [initialState, setInitialState] = useState({
    propertyName: "",
    propertyPhoto: "",
    status: "",
    orderNo: "",
  });

  // Prepopulate the form when editing
  useEffect(() => {
    if (isEditing && currentPropertyType) {
      setInitialState({
        propertyName: currentPropertyType.propertyName || "",
        propertyPhoto:
          currentPropertyType.propertyPhoto?.replace(/\/+/g, "/") || "",
        status: currentPropertyType.status ? "Yes" : "No",
        orderNo: currentPropertyType.orderNo || "",
      });
    } else {
      setInitialState({
        propertyName: "",
        propertyPhoto: "",
        status: "",
        orderNo: "",
      });
    }
  }, [isEditing, currentPropertyType]);

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing, currentPropertyType]);

  const handleOnSubmit = async (e, formData, handleReset) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Append all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === "propertyPhoto" && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (
          key === "propertyPhoto" &&
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
      if (isEditing && currentPropertyType) {
        response = await updatePropertyType(
          currentPropertyType._id,
          formDataToSend,
          token
        );
      } else {
        response = await createPropertyType(formDataToSend, token);
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
    propertyName: "Property Type Name",
    propertyPhoto: "Property Type Photo",
    status: "Status",
    orderNo: "Order Number",
  };

  const placeholders = {
    propertyName: "Enter property type name",
    propertyPhoto: "Upload property type photo",
    status: "Select status",
    orderNo: "Enter order number",
  };

  return (
    <ReusableForm
      formTitle={isEditing ? "Edit Property Type" : "Add Property Type"}
      initialState={initialState}
      onSubmit={handleOnSubmit}
      isEditing={isEditing}
      onCancelEdit={onCancelEdit}
      labels={labels}
      placeholders={placeholders}
    />
  );
};

export default AddPropertyType;
