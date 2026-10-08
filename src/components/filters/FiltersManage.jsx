import { useEffect, useState } from "react";
import { fetchFilters, deleteFilter } from "../../services/filterService";
import { fetchPropertyTypes } from "../../services/propertyTypeService";
import { fetchPropertyStatuses } from "../../services/propertyStatusService";
import { fetchAreas } from "../../services/areaService";
import { fetchLegacyFilterConfigs, upsertLegacyFilterConfig } from "../../services/legacyFilterConfigService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmationModal from "../common/ConfirmationModal";
import Pagination from "../Pagination";
import toast from "react-hot-toast";

const DEFAULT_LEGACY_LABELS = { propertyType: "Property Type", propertyStatus: "Property Status", area: "Area" };

const FiltersManage = ({ reload, onEditFilter }) => {
  const [filters, setFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState(null);
  const [legacyRenameTarget, setLegacyRenameTarget] = useState(null);
  const [legacyHideTarget, setLegacyHideTarget] = useState(null);
  const [isLegacyHideModalOpen, setIsLegacyHideModalOpen] = useState(false);

  useEffect(() => { loadFilters(); }, [page, limit, searchQuery, reload]);

  const loadFilters = async () => {
    try {
      const data = await fetchFilters(token);
      const legacyRows = [];
      let legacyConfigs = {};
      try {
        const configRes = await fetchLegacyFilterConfigs(token);
        (configRes.configs || []).forEach((c) => { legacyConfigs[c.key] = c; });
      } catch (e) { console.error("Error loading legacy filter configs:", e); }

      const buildLegacyRow = (key, options, legacyPath) => {
        const cfg = legacyConfigs[key];
        if (cfg?.hidden) return;
        legacyRows.push({ _id: `legacy-${key}`, key, name: cfg?.label || DEFAULT_LEGACY_LABELS[key], options, multiSelect: true, filterOrder: "-", isLegacy: true, legacyPath });
      };

      try {
        const typesRes = await fetchPropertyTypes(token);
        const activeTypes = (typesRes.propertyTypes || []).filter((t) => t.status === true);
        buildLegacyRow("propertyType", activeTypes.map((t) => t.propertyName), "/property/propertyType");
      } catch (e) { console.error("Error loading property types for merged view:", e); }

      try {
        const statusesRes = await fetchPropertyStatuses(token);
        const activeStatuses = (statusesRes.propertyStatuses || []).filter((s) => s.status === true);
        buildLegacyRow("propertyStatus", activeStatuses.map((s) => s.propertyStatusName), "/property/propertyStatus");
      } catch (e) { console.error("Error loading property statuses for merged view:", e); }

      try {
        const areasRes = await fetchAreas(token);
        buildLegacyRow("area", (areasRes || []).map((a) => a.area), "/area");
      } catch (e) { console.error("Error loading areas for merged view:", e); }

      setFilters([...legacyRows, ...data.filters]);
    } catch (error) { console.error("Error loading filters:", error); }
  };

  const handleDeleteClick = (id) => { setFilterToDelete(id); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    try { await deleteFilter(id, token); loadFilters(); } catch (error) { console.error("Error deleting filter:", error); }
  };

  const handleLegacyRenameClick = (f) => setLegacyRenameTarget({ key: f.key, value: f.name });
  const handleLegacyRenameSave = async () => {
    if (!legacyRenameTarget) return;
    const trimmed = (legacyRenameTarget.value || "").trim();
    if (!trimmed) { toast.error("Name can't be empty"); return; }
    try {
      await upsertLegacyFilterConfig(legacyRenameTarget.key, { label: trimmed }, token);
      toast.success("Renamed successfully");
      setLegacyRenameTarget(null);
      loadFilters();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error renaming filter");
      console.error("Error renaming legacy filter:", error);
    }
  };

  const handleLegacyHideClick = (key) => { setLegacyHideTarget(key); setIsLegacyHideModalOpen(true); };
  const handleLegacyHideConfirm = async () => {
    if (!legacyHideTarget) return;
    try {
      await upsertLegacyFilterConfig(legacyHideTarget, { hidden: true }, token);
      toast.success("Removed from filters view");
      loadFilters();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error removing filter");
      console.error("Error hiding legacy filter:", error);
    } finally {
      setIsLegacyHideModalOpen(false);
      setLegacyHideTarget(null);
    }
  };

  const handleSearch = (e) => { setSearchQuery(e.target.value); setPage(1); };
  const filteredList = filters.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase() || ""));
  const totalPages = Math.ceil(filteredList.length / limit);
  const paginatedList = filteredList.slice((page - 1) * limit, page * limit);
  const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setPage(newPage); };

  return (
    <div className="max-w-sm md:max-w-[92%] ml-0 md:ml-10 mt-10 p-4 flex-1 bg-secondary-50 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Manage Filters</h2>
      <div className="mb-6">
        <IoSearchOutline className="absolute mt-3 ml-2 text-accent-600" />
        <input type="text" placeholder="Search filters..." value={searchQuery} onChange={handleSearch}
          className="w-full md:w-1/2 px-4 py-2 pl-7 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-400 text-white">
              <th className="p-3 text-left">Filter Name</th>
              <th className="p-3 text-left">Options</th>
              <th className="p-3 text-left">Multi-Select</th>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((f) => (
              <tr key={f._id} className="border-b border-accent-300 hover:bg-secondary-100">
                <td className="p-3 font-medium">
                  {f.isLegacy && legacyRenameTarget?.key === f.key ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={legacyRenameTarget.value}
                        onChange={(e) => setLegacyRenameTarget({ ...legacyRenameTarget, value: e.target.value })}
                        className="px-2 py-1 border border-accent-300 rounded-md text-sm" autoFocus />
                      <button onClick={handleLegacyRenameSave} className="text-green-700 text-sm font-semibold">Save</button>
                      <button onClick={() => setLegacyRenameTarget(null)} className="text-gray-500 text-sm">Cancel</button>
                    </div>
                  ) : f.name}
                </td>
                <td className="p-3 text-sm text-gray-600">{(f.options || []).join(", ") || "—"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${f.multiSelect ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {f.multiSelect ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3">{f.filterOrder}</td>
                <td className="p-3">
                  {f.isLegacy ? (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleLegacyRenameClick(f)} className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300">Edit</button>
                      <button onClick={() => navigate(f.legacyPath)} className="bg-primary-400 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition duration-300">Manage</button>
                      <button onClick={() => handleLegacyHideClick(f.key)} className="bg-error-200 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300">Delete</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => onEditFilter(f)} className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2">Edit</button>
                      <button onClick={() => handleDeleteClick(f._id)} className="bg-error-200 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onConfirm={() => { handleDelete(filterToDelete); setIsModalOpen(false); }}
        message="Are you sure you want to delete this filter?" action="Delete" />
      <ConfirmationModal isOpen={isLegacyHideModalOpen}
        onClose={() => { setIsLegacyHideModalOpen(false); setLegacyHideTarget(null); }}
        onConfirm={handleLegacyHideConfirm}
        message="This removes the group from this Filters view only — the underlying data (and any tours using it) stays untouched. You can bring it back later."
        action="Delete" />
    </div>
  );
};

export default FiltersManage;
