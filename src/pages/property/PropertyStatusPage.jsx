import React, { useState } from "react";
import AddPropertyStatus from "../../components/propertyStatus/AddPropertyStatus";
import logo2 from "../../assets/images/360eye_logo 4.png";
import PropertyStatusManage from "../../components/propertyStatus/PropertyStatusManage";

const PropertyStatusPage = () => {
  const [isEditing, setIsEditing] = useState(false); // Track if we're in edit mode
  const [currentPropertyStatus, setCurrentPropertyStatus] = useState(null); // Store the category being edited
  const [reload, setReload] = useState(false); // State to trigger re-fetch

  const handleSuccess = () => {
    setReload((prev) => !prev); // Toggle state to trigger re-fetch
  };

  return (
    <div className="bg-secondary-100 flex flex-col relative">
      {/* Logo */}
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />

      {/* Add/Edit Category Form */}
      <AddPropertyStatus
        isEditing={isEditing}
        currentPropertyStatus={currentPropertyStatus}
        onCancelEdit={() => {
          setIsEditing(false); // Exit edit mode
          setCurrentPropertyStatus(null); // Clear the current category
        }}
        onSuccess={handleSuccess} // Trigger re-fetch on success
      />

      {/* Category Management Table */}
      <PropertyStatusManage
        reload={reload} // Pass reload state to trigger re-fetch
        onEditPropertyStatus={(propertyStatus) => {
          setIsEditing(true); // Enter edit mode
          setCurrentPropertyStatus(propertyStatus); // Set the category being edited
        }}
      />
    </div>
  );
};

export default PropertyStatusPage;
