import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchPartners, createPartner, updatePartner, deletePartner } from "../../services/partnerService";
import logo2 from "../../assets/images/360eye_logo 4.png";

const PartnersPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [partners, setPartners] = useState([]);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [partnerOrder, setPartnerOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const data = await fetchPartners(token);
      setPartners(data.partners || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setName("");
    setLogoFile(null);
    setPartnerOrder(0);
    setIsActive(true);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("partnerOrder", partnerOrder);
    formData.append("isActive", isActive);
    if (logoFile) formData.append("logo", logoFile);

    try {
      if (editingId) {
        await updatePartner(editingId, formData, token);
      } else {
        if (!logoFile) return alert("Logo is required");
        await createPartner(formData, token);
      }
      resetForm();
      load();
    } catch (error) {
      // toast already shown
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setName(p.name);
    setPartnerOrder(p.partnerOrder || 0);
    setIsActive(p.isActive);
    setLogoFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this partner?")) return;
    try {
      await deletePartner(id, token);
      load();
    } catch (error) {
      // toast already shown
    }
  };

  return (
    <div className="bg-secondary-100 flex flex-col relative">
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />

      <div className="max-w-3xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">{editingId ? "Edit Partner" : "Add Business Partner"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Partner Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Order</label>
              <input
                type="number"
                value={partnerOrder}
                onChange={(e) => setPartnerOrder(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo {editingId ? "(optional - leave blank to keep current)" : ""}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files[0])}
              className="mt-1 block w-full text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600">
              {editingId ? "Update Partner" : "Add Partner"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="max-w-sm md:max-w-[92%] ml-0 md:ml-10 mt-10 mb-10 p-4 flex-1 bg-secondary-50 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Manage Partners</h2>
        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary-400 text-white">
                <th className="p-3 text-left">Logo</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p._id} className="border-b border-accent-300 hover:bg-secondary-100">
                  <td className="p-3">
                    <img src={`${import.meta.env.VITE_BACKEND_URL}${p.logo}`} alt={p.name} className="w-12 h-12 object-contain rounded-md bg-white" />
                  </td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">{p.partnerOrder}</td>
                  <td className="p-3">
                    <button onClick={() => handleEdit(p)} className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 mr-2">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="bg-error-200 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete</button>
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr><td colSpan={5} className="p-3 text-center text-gray-400">No partners yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;
