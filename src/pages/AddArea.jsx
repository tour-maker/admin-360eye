import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { createArea, updateArea } from "../services/areaService";

const AddArea = ({ isEditing, currentArea, onCancelEdit, onSuccess }) => {
  const { token } = useSelector((state) => state.auth);
  const [area, setArea] = useState("");

  useEffect(() => {
    console.log("currentArea updated in AddArea:", currentArea);
    if (isEditing && currentArea) {
      setArea(currentArea.area);
    } else {
      setArea("");
    }
  }, [isEditing, currentArea]);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        console.log("Updating Area:", currentArea._id, area);
        await updateArea(currentArea._id, { area }, token);
      } else {
        console.log("Creating Area:", area);
        await createArea({ area }, token);
      }

      setArea("");
      onSuccess();
      onCancelEdit();
    } catch (error) {
      console.error("Error submitting area:", error);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-700">
        {isEditing ? "Edit Area" : "Add Area"}
      </h2>
      <form onSubmit={handleOnSubmit} className="mt-4 space-y-4">
        <input
          type="text"
          placeholder="Enter area name"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-primary-400 text-white px-4 py-2 rounded-md">
            {isEditing ? "Update" : "Save"}
          </button>
          {isEditing && (
            <button
              onClick={onCancelEdit}
              className="bg-info-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddArea;
