import React, { useState } from "react";
import CategoryManage from "../../components/category/CategoryManage";
import AddMainCategory from "../../components/category/AddMainCategory";
import logo2 from "../../assets/images/360eye_logo 4.png";

const CategoryPage = () => {
  const [isEditing, setIsEditing] = useState(false); // Track if we're in edit mode
  const [currentCategory, setCurrentCategory] = useState(null); // Store the category being edited
  const [reload, setReload] = useState(false); // State to trigger re-fetch

  const handleSuccess = () => {
    setReload((prev) => !prev); // Toggle state to trigger re-fetch
  };

  return (
    <div className="bg-secondary-100 flex flex-col relative">
      {/* Logo */}
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />

      {/* Add/Edit Category Form */}
      <AddMainCategory
        isEditing={isEditing} // Pass edit mode state
        currentCategory={currentCategory} // Pass the category being edited
        onCancelEdit={() => {
          setIsEditing(false); // Exit edit mode
          setCurrentCategory(null); // Clear the current category
        }}
        onSuccess={handleSuccess} // Trigger re-fetch on success
      />

      {/* Category Management Table */}
      <CategoryManage
        reload={reload} // Pass reload state to trigger re-fetch
        onEditCategory={(category) => {
          setIsEditing(true); // Enter edit mode
          setCurrentCategory(category); // Set the category being edited
        }}
      />
    </div>
  );
};

export default CategoryPage;