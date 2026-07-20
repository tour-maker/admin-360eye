import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchClientAccessList, deleteClientAccess } from "../../services/clientAccessService";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiCopy, FiExternalLink } from "react-icons/fi";

const ClientAccessTable = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await fetchClientAccessList(token);
      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client access link? This cannot be undone.")) return;
    try {
      await deleteClientAccess(id, token);
      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleCopyLink = (slug) => {
    const link = `${window.location.origin.replace(/\/#.*/, "")}/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const getStatusBadge = (client) => {
    if (!client.isActive) return <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">Inactive</span>;
    if (client.expiresAt && new Date(client.expiresAt) < new Date())
      return <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600">Expired</span>;
    return <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600">Active</span>;
  };

  return (
    <div className="max-w-6xl mx-auto md:ml-10 mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Client Access Links</h2>
        <button
          onClick={() => navigate("/client-access/add")}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          + Add Client Access
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-500">No client access links yet. Create one to get started.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client._id}>
                  <td className="px-4 py-3 text-sm text-gray-800">{client.clientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      /{client.slug}
                      <button onClick={() => handleCopyLink(client.slug)} title="Copy link">
                        <FiCopy size={14} className="text-gray-400 hover:text-gray-700" />
                      </button>
                      <a href={`/${client.slug}`} target="_blank" rel="noreferrer" title="Open link">
                        <FiExternalLink size={14} className="text-gray-400 hover:text-gray-700" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{client.assignedTours?.length || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {client.expiresAt ? new Date(client.expiresAt).toLocaleDateString() : "No expiry"}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(client)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/client-access/edit/${client._id}`, { state: { client } })}
                        title="Edit"
                      >
                        <FiEdit2 size={16} className="text-gray-500 hover:text-primary-600" />
                      </button>
                      <button onClick={() => handleDelete(client._id)} title="Delete">
                        <FiTrash2 size={16} className="text-gray-500 hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientAccessTable;
