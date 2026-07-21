import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createClientAccess, updateClientAccess, fetchClientAccessById } from "../../services/clientAccessService";
import { fetchProducts } from "../../services/productService";
import toast from "react-hot-toast";

const AddClientAccess = ({ isEditing }) => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();
  const location = useLocation();
  const clientToEdit = location.state?.client;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientName: "",
    slug: "",
    assignedTours: [],
    allAccess: true,
    expiresAt: "",
    isActive: true,
    notes: "",
  });

  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const res = await fetchProducts(token, { page: 1, limit: 1000 });
        setAllTours(res.products || []);
      } catch (error) {
        console.error("Error loading tours:", error);
      }
    };
    loadTours();
  }, [token]);

  useEffect(() => {
    const loadClient = async () => {
      if (isEditing && id) {
        try {
          const client = clientToEdit || (await fetchClientAccessById(id, token));
          setFormData({
            clientName: client.clientName || "",
            slug: client.slug || "",
            assignedTours: (client.assignedTours || []).map((t) => (typeof t === "string" ? t : t._id)),
            allAccess: client.allAccess !== undefined ? client.allAccess : true,
            expiresAt: client.expiresAt ? new Date(client.expiresAt).toISOString().slice(0, 10) : "",
            isActive: client.isActive !== undefined ? client.isActive : true,
            notes: client.notes || "",
          });
        } catch (error) {
          console.error("Error loading client:", error);
        }
      }
    };
    loadClient();
  }, [isEditing, id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTourToggle = (tourId) => {
    setFormData((prev) => {
      const exists = prev.assignedTours.includes(tourId);
      return {
        ...prev,
        assignedTours: exists
          ? prev.assignedTours.filter((t) => t !== tourId)
          : [...prev.assignedTours, tourId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };
      if (isEditing && id) {
        await updateClientAccess(id, payload, token);
      } else {
        await createClientAccess(payload, token);
      }
      navigate("/client-access");
    } catch (error) {
      console.error("Error saving client access:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? "Edit Client Access" : "Add Client Access"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Shreepad Group"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Custom URL Slug {!isEditing && "(auto-generated if left blank)"}
          </label>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span>yoursite.com/</span>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="flex-1 px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="shreepaduser"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Access Expiry (leave blank for no expiry)</label>
          <input
            type="date"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (internal, optional)</label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allAccess"
            name="allAccess"
            checked={formData.allAccess}
            onChange={handleChange}
            className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="allAccess" className="text-sm font-medium text-gray-700">
            Give access to all tours (including future ones added later)
          </label>
        </div>

        {!formData.allAccess && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Accessible Tours ({formData.assignedTours.length} selected)
            </label>
            <div className="max-h-64 overflow-y-auto border border-accent-300 rounded-md p-3 space-y-2">
              {allTours.length === 0 && <p className="text-sm text-gray-400">Loading tours...</p>}
              {allTours.map((tour) => (
                <div key={tour._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`tour-${tour._id}`}
                    checked={formData.assignedTours.includes(tour._id)}
                    onChange={() => handleTourToggle(tour._id)}
                    className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor={`tour-${tour._id}`} className="text-sm text-gray-700">
                    {tour.tourName}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Update Client Access" : "Create Client Access"}
        </button>
      </form>
    </div>
  );
};

export default AddClientAccess;
