import React, { useState } from "react";
import AddPropertyType from "../../components/propertyType/AddPropertyType";
import logo2 from "../../assets/images/360eye_logo 4.png";
import PropertyTypeManage from "../../components/propertyType/PropertyTypeManage";

const PropertyTypePage = () => {
  const [isEditing, setIsEditing] = useState(false); // Track if we're in edit mode
  const [currentPropertyType, setCurrentPropertyType] = useState(null); // Store the property type being edited
  const [reload, setReload] = useState(false); // State to trigger re-fetch

  const handleSuccess = () => {
    setReload((prev) => !prev); // Toggle state to trigger re-fetch
  };

  return (
    <div className="bg-secondary-100 flex flex-col relative">
      {/* Logo */}
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />

      {/* Add/Edit Property Type Form */}
      <AddPropertyType
        isEditing={isEditing}
        currentPropertyType={currentPropertyType}
        onCancelEdit={() => {
          setIsEditing(false); // Exit edit mode
          setCurrentPropertyType(null); // Clear the current property type
        }}
        onSuccess={handleSuccess} // Trigger re-fetch on success
      />

      {/* Property Type Management Table */}
      <PropertyTypeManage
        reload={reload} // Pass reload state to trigger re-fetch
        onEditPropertyType={(propertyType) => {
          setIsEditing(true); // Enter edit mode
          setCurrentPropertyType(propertyType); // Set the property type being edited
        }}
      />
    </div>
  );
};

export default PropertyTypePage;