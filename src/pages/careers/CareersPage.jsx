import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchCareerSettings,
  updateCareerSettings,
  fetchApplications,
  deleteApplication,
} from "../../services/careerService";
import logo2 from "../../assets/images/360eye_logo 4.png";

const FIELD_TYPES = ["text", "email", "phone", "textarea", "file", "url"];

const EMPTY_QUESTION = { label: "", fieldType: "text", required: true, helpText: "", questionOrder: 0 };

const CareersPage = () => {
  const { token } = useSelector((state) => state.auth);

  // Roles state
  const [roles, setRoles] = useState([]);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleImage, setRoleImage] = useState("");
  const [roleIsOpen, setRoleIsOpen] = useState(true);
  const [roleOrder, setRoleOrder] = useState(0);
  const [roleQuestions, setRoleQuestions] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);

  // Settings state
  const [googleFormBaseUrl, setGoogleFormBaseUrl] = useState("");
  const [roleEntryId, setRoleEntryId] = useState("");
  const [tagline, setTagline] = useState("");
  const [subline, setSubline] = useState("");

  // Applications state
  const [applications, setApplications] = useState([]);
  const [expandedAppId, setExpandedAppId] = useState(null);

  const loadRoles = async () => {
    try {
      const data = await fetchRoles(token);
      setRoles(data.roles || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await fetchCareerSettings(token);
      setGoogleFormBaseUrl(data.settings?.googleFormBaseUrl || "");
      setRoleEntryId(data.settings?.roleEntryId || "");
      setTagline(data.settings?.tagline || "");
      setSubline(data.settings?.subline || "");
    } catch (error) {
      console.error(error);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await fetchApplications(token);
      setApplications(data.applications || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      loadRoles();
      loadSettings();
      loadApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetRoleForm = () => {
    setRoleTitle("");
    setRoleDescription("");
    setRoleImage("");
    setRoleIsOpen(true);
    setRoleOrder(0);
    setRoleQuestions([]);
    setEditingRoleId(null);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: roleTitle,
      description: roleDescription,
      image: roleImage,
      isOpen: roleIsOpen,
      roleOrder,
      questions: roleQuestions,
    };
    try {
      if (editingRoleId) {
        await updateRole(editingRoleId, payload, token);
      } else {
        await createRole(payload, token);
      }
      resetRoleForm();
      loadRoles();
    } catch (error) {
      // toast already shown
    }
  };

  const handleEditRole = (role) => {
    setEditingRoleId(role._id);
    setRoleTitle(role.title);
    setRoleDescription(role.description || "");
    setRoleImage(role.image || "");
    setRoleIsOpen(role.isOpen);
    setRoleOrder(role.roleOrder || 0);
    setRoleQuestions(role.questions || []);
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      await deleteRole(id, token);
      loadRoles();
    } catch (error) {
      // toast already shown
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCareerSettings({ googleFormBaseUrl, roleEntryId, tagline, subline }, token);
    } catch (error) {
      // toast already shown
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await deleteApplication(id, token);
      loadApplications();
    } catch (error) {
      // toast already shown
    }
  };

  // ---- Question editor helpers ----
  const addQuestion = () => {
    setRoleQuestions((prev) => [...prev, { ...EMPTY_QUESTION, questionOrder: prev.length + 1 }]);
  };

  const updateQuestion = (index, field, value) => {
    setRoleQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const removeQuestion = (index) => {
    setRoleQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index, direction) => {
    setRoleQuestions((prev) => {
      const newArr = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
      return newArr.map((q, i) => ({ ...q, questionOrder: i + 1 }));
    });
  };

  return (
    <div className="bg-secondary-100 flex flex-col relative">
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />

      {/* Settings */}
      <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">Careers Page Settings</h2>
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hero Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub-line (what 360EYE specializes in)</label>
            <textarea
              value={subline}
              onChange={(e) => setSubline(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Google Form Base URL (legacy, optional)</label>
              <input
                type="text"
                value={googleFormBaseUrl}
                onChange={(e) => setGoogleFormBaseUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role Field Entry ID (legacy, optional)</label>
              <input
                type="text"
                value={roleEntryId}
                onChange={(e) => setRoleEntryId(e.target.value)}
                placeholder="entry.123456789"
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <button type="submit" className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600">
            Save Settings
          </button>
        </form>
      </div>

      {/* Add/Edit Role */}
      <div className="max-w-4xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10 mt-10">
        <h2 className="text-xl font-semibold mb-6">{editingRoleId ? "Edit Role" : "Add Role"}</h2>
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                required
                placeholder="e.g. Frontend Developer"
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Order</label>
              <input
                type="number"
                value={roleOrder}
                onChange={(e) => setRoleOrder(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="roleIsOpen"
                  checked={roleIsOpen}
                  onChange={(e) => setRoleIsOpen(e.target.checked)}
                  className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="roleIsOpen" className="text-sm font-medium text-gray-700">
                  Open for applications
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Card Image URL</label>
            <input
              type="text"
              value={roleImage}
              onChange={(e) => setRoleImage(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Question editor */}
          <div className="border border-accent-300 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Application Form Questions</label>
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm bg-primary-500 text-white px-3 py-1 rounded-md hover:bg-primary-600"
              >
                + Add Question
              </button>
            </div>
            <div className="space-y-3">
              {roleQuestions.map((q, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center border-b border-accent-200 pb-3">
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => updateQuestion(index, "label", e.target.value)}
                    placeholder="Question label"
                    className="md:col-span-4 px-3 py-2 border border-accent-300 rounded-md text-sm"
                  />
                  <select
                    value={q.fieldType}
                    onChange={(e) => updateQuestion(index, "fieldType", e.target.value)}
                    className="md:col-span-2 px-3 py-2 border border-accent-300 rounded-md text-sm"
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={q.helpText || ""}
                    onChange={(e) => updateQuestion(index, "helpText", e.target.value)}
                    placeholder="Help text (optional)"
                    className="md:col-span-3 px-3 py-2 border border-accent-300 rounded-md text-sm"
                  />
                  <label className="md:col-span-1 flex items-center gap-1 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(index, "required", e.target.checked)}
                      className="h-4 w-4"
                    />
                    Req
                  </label>
                  <div className="md:col-span-2 flex gap-1 justify-end">
                    <button type="button" onClick={() => moveQuestion(index, -1)} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">↑</button>
                    <button type="button" onClick={() => moveQuestion(index, 1)} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">↓</button>
                    <button type="button" onClick={() => removeQuestion(index)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">✕</button>
                  </div>
                </div>
              ))}
              {roleQuestions.length === 0 && (
                <p className="text-xs text-gray-400">No questions added. Click "+ Add Question" to build the application form for this role.</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600">
              {editingRoleId ? "Update Role" : "Add Role"}
            </button>
            {editingRoleId && (
              <button type="button" onClick={resetRoleForm} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Manage Roles */}
      <div className="max-w-sm md:max-w-[92%] ml-0 md:ml-10 mt-10 p-4 flex-1 bg-secondary-50 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Manage Roles</h2>
        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary-400 text-white">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Questions</th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r._id} className="border-b border-accent-300 hover:bg-secondary-100">
                  <td className="p-3 font-medium">{r.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${r.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {r.isOpen ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{(r.questions || []).length} questions</td>
                  <td className="p-3">{r.roleOrder}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEditRole(r)}
                      className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(r._id)}
                      className="bg-error-200 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-400">No roles yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications */}
      <div className="max-w-sm md:max-w-[92%] ml-0 md:ml-10 mt-10 mb-10 p-4 flex-1 bg-secondary-50 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Applications ({applications.length})</h2>
        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary-400 text-white">
                <th className="p-3 text-left">Applicant</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Sheet Synced</th>
                <th className="p-3 text-left">Submitted</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <>
                  <tr key={app._id} className="border-b border-accent-300 hover:bg-secondary-100">
                    <td className="p-3">
                      <div className="font-medium">{app.applicantName || "—"}</div>
                      <div className="text-xs text-gray-500">{app.applicantEmail}</div>
                    </td>
                    <td className="p-3">{app.roleTitle}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-sm ${app.syncedToSheet ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {app.syncedToSheet ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{new Date(app.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setExpandedAppId(expandedAppId === app._id ? null : app._id)}
                        className="bg-accent-400 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition duration-300 mr-2"
                      >
                        {expandedAppId === app._id ? "Hide" : "View"}
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(app._id)}
                        className="bg-error-200 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedAppId === app._id && (
                    <tr>
                      <td colSpan={5} className="p-4 bg-secondary-100">
                        <div className="space-y-2">
                          {(app.answers || []).map((a, i) => (
                            <div key={i} className="text-sm">
                              <span className="font-medium">{a.label}: </span>
                              {a.fieldType === "file" ? (
                                a.fileUrl ? (
                                  <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-primary-600 underline">
                                    {a.value || "View file"}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">{a.value || "No file"}</span>
                                )
                              ) : (
                                <span>{a.value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-400">No applications yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
