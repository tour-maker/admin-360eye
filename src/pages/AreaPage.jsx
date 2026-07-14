import React, { useState } from "react";
import ManageArea from "../components/Area/ManageArea";
import AddArea from "./AddArea";
import logo2 from "../assets/images/360eye_logo 4.png";

const AreaPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentArea, setCurrentArea] = useState(null);
  const [reload, setReload] = useState(false);

  const handleSuccess = () => {
    setReload((prev) => !prev);
  };

  return (
    <div className="bg-secondary-100 flex flex-col relative">
      {/* Logo */}
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />

      {/* Add/Edit Area Form */}
       
      {/* Manage Area Table */}
      <ManageArea
        reload={reload}
        onEditArea={(area) => {
          setIsEditing(true);
          setCurrentArea(area);
        }}
      />
    </div>
  );
};

export default AreaPage;
