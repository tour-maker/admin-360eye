// AddMainCategory.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createCategory, updateCategory } from "../../services/categoryService";
import ReusableForm from "../ReusableForm";

const AddMainCategory = ({
  isEditing,
  currentCategory,
  onCancelEdit,
  onSuccess,
}) => {
  const { token } = useSelector((state) => state.auth);
  const [initialState, setInitialState] = useState({
    categoryName: "",
    categoryPhoto: "",
    status: "",
    orderNo: "",
  });

  // Prepopulate the form when editing
  useEffect(() => {
    if (isEditing && currentCategory) {
      setInitialState({
        categoryName: currentCategory.categoryName || "",
        categoryPhoto:
          currentCategory.categoryPhoto?.replace(/\/+/g, "/") || "",
        status: currentCategory.status ? "Yes" : "No",
        orderNo: currentCategory.orderNo || "",
      });
    } else {
      setInitialState({
        categoryName: "",
        categoryPhoto: "",
        status: "",
        orderNo: "",
      });
    }
  }, [isEditing, currentCategory]);

  useEffect(() => {
    if (isEditing) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    }
  }, [isEditing, currentCategory]);

  const handleOnSubmit = async (e, formData, handleReset) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Append all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === "categoryPhoto" && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (
          key === "categoryPhoto" &&
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
      if (isEditing && currentCategory) {
        response = await updateCategory(
          currentCategory._id,
          formDataToSend,
          token
        );
      } else {
        response = await createCategory(formDataToSend, token);
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
    categoryName: "Category Name",
    categoryPhoto: "Category Photo",
    status: "Status",
    orderNo: "Order Number",
  };

  const placeholders = {
    categoryName: "Enter category name",
    categoryPhoto: "Upload category photo",
    status: "Select status",
    orderNo: "Enter order number",
  };

  return (
    <ReusableForm
      formTitle={isEditing ? "Edit Category" : "Add Main Category"}
      initialState={initialState}
      onSubmit={handleOnSubmit}
      isEditing={isEditing}
      onCancelEdit={onCancelEdit}
      labels={labels}
      placeholders={placeholders}
    />
  );
};

export default AddMainCategory;
