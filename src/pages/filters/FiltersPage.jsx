import React, { useState } from "react";
import AddFilter from "../../components/filters/AddFilter";
import FiltersManage from "../../components/filters/FiltersManage";
import logo2 from "../../assets/images/360eye_logo 4.png";

const FiltersPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [reload, setReload] = useState(false);

  const handleSuccess = () => {
    setReload((prev) => !prev);
  };

  return (
    <div className="bg-secondary-100 flex flex-col relative">
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />
      <AddFilter
        isEditing={isEditing}
        currentFilter={currentFilter}
        onCancelEdit={() => {
          setIsEditing(false);
          setCurrentFilter(null);
        }}
        onSuccess={handleSuccess}
      />
      <FiltersManage
        reload={reload}
        onEditFilter={(filter) => {
          setIsEditing(true);
          setCurrentFilter(filter);
        }}
      />
    </div>
  );
};

export default FiltersPage;
