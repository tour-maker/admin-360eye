import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createFilter, updateFilter } from "../../services/filterService";

const AddFilter = ({ isEditing, currentFilter, onCancelEdit, onSuccess }) => {
  const { token } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [multiSelect, setMultiSelect] = useState(true);
  const [filterOrder, setFilterOrder] = useState(0);

  useEffect(() => {
    if (isEditing && currentFilter) {
      setName(currentFilter.name || "");
      setOptionsText((currentFilter.options || []).join(", "));
      setMultiSelect(currentFilter.multiSelect !== false);
      setFilterOrder(currentFilter.filterOrder || 0);
    } else {
      setName("");
      setOptionsText("");
      setMultiSelect(true);
      setFilterOrder(0);
    }
  }, [isEditing, currentFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const options = optionsText
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    const payload = { name, options, multiSelect, filterOrder };

    try {
      let response;
      if (isEditing && currentFilter) {
        response = await updateFilter(currentFilter._id, payload, token);
      } else {
        response = await createFilter(payload, token);
      }
      if (response.success) {
        onSuccess();
        if (isEditing) {
          onCancelEdit();
        } else {
          setName("");
          setOptionsText("");
          setMultiSelect(true);
          setFilterOrder(0);
        }
      }
    } catch (error) {
      // toast already shown by service
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? "Edit Filter" : "Add Filter"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Filter Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Property Type"
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Order
            </label>
            <input
              type="number"
              value={filterOrder}
              onChange={(e) => setFilterOrder(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end pb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="multiSelect"
                checked={multiSelect}
                onChange={(e) => setMultiSelect(e.target.checked)}
                className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="multiSelect" className="text-sm font-medium text-gray-700">
                Allow multiple selection
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Options (comma separated)
          </label>
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            placeholder="e.g. Available, Reserved, Sold"
            rows={3}
            className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
          >
            {isEditing ? "Update Filter" : "Add Filter"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddFilter;
