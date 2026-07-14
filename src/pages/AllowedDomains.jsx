import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  createAllowedDomain,
  deleteAllowedDomain,
  fetchAllowedDomains,
  getSecurityConfigPreview,
  refreshSecurityConfig,
  updateAllowedDomain,
  updateAllowedDomainStatus,
} from "../services/allowedDomainService.js";
import logo from "../assets/images/360eye_logo 4.png";

const DEFAULT_FORM_STATE = {
  id: null,
  domainLabel: "",
  origin: "",
  contactEmail: "",
  contactPhone: "",
  ownerEmails: "",
  expiryDate: "",
  remindBeforeDays: 15,
  notes: "",
  isActive: true,
};

const toOwnerEmailsInput = (emails) =>
  Array.isArray(emails) && emails.length ? emails.join(", ") : "";

const parseOwnerEmails = (value) =>
  String(value || "")
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch (_error) {
    return value;
  }
};

const formatReminderWindow = (value) =>
  typeof value === "number" && Number.isFinite(value) ? `${value} days` : "Default";

const AllowedDomains = () => {
  const { token } = useSelector((state) => state.auth);
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState([]);
  const [securityConfig, setSecurityConfig] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const isEditing = useMemo(() => Boolean(formState.id), [formState.id]);

  const resetForm = () => setFormState(DEFAULT_FORM_STATE);

  const loadDomains = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetchAllowedDomains(token, {
        includeInactive: true,
        includeExpired: true,
      });
      setDomains(response?.domains || []);
      setSecurityConfig(response?.securityConfig || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "remindBeforeDays"
          ? value === "" || value === null
            ? ""
            : Number(value)
          : value,
    }));
  };

  const populateFormForEdit = (domain) => {
    setFormState({
      id: domain.id,
      domainLabel: domain.domainLabel || "",
      origin: domain.origin || "",
      contactEmail: domain.contactEmail || "",
      contactPhone: domain.contactPhone || "",
      ownerEmails: toOwnerEmailsInput(domain.ownerEmails),
      expiryDate: domain.expiryDate ? domain.expiryDate.substring(0, 10) : "",
      remindBeforeDays:
        typeof domain.remindBeforeDays === "number" ? domain.remindBeforeDays : "",
      notes: domain.notes || "",
      isActive: domain.isActive !== false,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;

    const payload = {
      domainLabel: formState.domainLabel,
      origin: formState.origin,
      contactEmail: formState.contactEmail,
      contactPhone: formState.contactPhone,
      ownerEmails: parseOwnerEmails(formState.ownerEmails),
      expiryDate: formState.expiryDate || null,
      remindBeforeDays:
        formState.remindBeforeDays === "" ? undefined : Number(formState.remindBeforeDays),
      notes: formState.notes,
      isActive: formState.isActive,
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateAllowedDomain(token, formState.id, payload);
      } else {
        await createAllowedDomain(token, payload);
      }
      resetForm();
      loadDomains();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (domain) => {
    if (!token) return;
    if (domain.isSystemDomain && !domain.isActive) {
      return;
    }
    const nextStatus = !domain.isActive;
    await updateAllowedDomainStatus(token, domain.id, nextStatus);
    loadDomains();
  };

  const handleDelete = async (domain) => {
    if (!token || domain.isSystemDomain) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${domain.domain || domain.origin}?`
    );
    if (!confirmDelete) return;
    await deleteAllowedDomain(token, domain.id);
    if (formState.id === domain.id) {
      resetForm();
    }
    loadDomains();
  };

  const handleRefreshConfig = async () => {
    if (!token) return;
    setPreviewLoading(true);
    try {
      await refreshSecurityConfig(token);
      const preview = await getSecurityConfigPreview(token);
      setSecurityConfig(preview?.securityConfig || securityConfig);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    const loadPreview = async () => {
      if (!token) return;
      try {
        const preview = await getSecurityConfigPreview(token);
        setSecurityConfig(preview?.securityConfig || null);
      } catch (error) {
        console.error("Failed to load security config preview", error);
      }
    };

    loadPreview();
  }, [token]);

  const renderDomainRow = (domain) => {
    const isInactive = !domain.isActive;
    const isExpired = domain.expired;

    return (
      <tr
        key={domain.id}
        className={`text-sm ${isInactive ? "opacity-60" : ""}`}
      >
        <td className="px-4 py-2 font-medium">{domain.domainLabel || domain.domain}</td>
        <td className="px-4 py-2 break-all">
          <div className="flex flex-col">
            <span className="font-mono text-xs">{domain.origin}</span>
          </div>
        </td>
        <td className="px-4 py-2">{formatDate(domain.expiryDate)}</td>
        <td className="px-4 py-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
              isInactive
                ? "bg-gray-200 text-gray-700"
                : isExpired
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isInactive ? "Inactive" : isExpired ? "Expired" : "Active"}
          </span>
        </td>
        <td className="px-4 py-2">{domain.contactEmail || "—"}</td>
        <td className="px-4 py-2 whitespace-nowrap">
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded bg-primary-500 px-3 py-1 text-white transition hover:bg-primary-600"
              onClick={() => populateFormForEdit(domain)}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded bg-amber-500 px-3 py-1 text-black transition hover:bg-amber-600"
              onClick={() => handleToggleStatus(domain)}
              disabled={domain.isSystemDomain && !domain.isActive}
            >
              {domain.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              type="button"
              className="rounded bg-red-500 px-3 py-1 text-black transition hover:bg-red-600 disabled:opacity-50"
              onClick={() => handleDelete(domain)}
              disabled={domain.isSystemDomain}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    );
  };


  return (
    <div className="relative min-h-screen bg-secondary-100 px-4 py-6 sm:px-6 lg:px-8">
      <img
        src={logo}
        alt="logo"
        className="absolute right-4 top-4 hidden w-24 lg:block xl:right-10 xl:top-8 xl:w-28"
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 pt-10">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-secondary-900 md:text-3xl">
            Allowed Domains & Security
          </h1>
          <p className="max-w-3xl text-sm text-secondary-600 md:text-base">
            Manage iframe allow-list domains, reminder windows, and preview the current security
            configuration powering the website.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-secondary-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">
                {isEditing ? "Edit Allowed Domain" : "Add Allowed Domain"}
              </h2>
              <p className="text-sm text-secondary-500">
                Capture ownership details so reminders reach the right people.
              </p>
            </div>
            {isEditing && (
              <button
                type="button"
                className="text-sm font-medium text-primary-600 transition hover:text-primary-700"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-4 rounded-xl border border-secondary-200/70 bg-secondary-50/60 p-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700">Domain or Origin</label>
                <input
                  name="origin"
                  id="origin"
                  value={formState.origin}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-accent-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="https://example.com"
                  required
                />
                <p className="mt-1 text-xs text-secondary-500">
                  Accepts full origin (protocol + host). Hostname will be auto-derived.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700" htmlFor="domainLabel">
                  Label
                </label>
                <input
                  id="domainLabel"
                  name="domainLabel"
                  value={formState.domainLabel}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-accent-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Display name (optional)"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-secondary-200/70 bg-secondary-50/60 p-4">
              <span className="text-sm font-medium uppercase tracking-wide text-secondary-500">
                Contacts
              </span>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700" htmlFor="contactEmail">
                    Contact email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formState.contactEmail}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-accent-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    placeholder="owner@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700" htmlFor="contactPhone">
                    Phone
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    value={formState.contactPhone}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-accent-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700" htmlFor="ownerEmails">
                  Owner emails
                </label>
                <textarea
                  id="ownerEmails"
                  name="ownerEmails"
                  value={formState.ownerEmails}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-accent-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Separate emails with comma or newline"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-secondary-200/70 bg-secondary-50/60 p-4">
              <span className="text-sm font-medium uppercase tracking-wide text-secondary-500">
                Reminder schedule
              </span>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700" htmlFor="expiryDate">
                    Expiry date
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formState.expiryDate}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-accent-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700" htmlFor="remindBeforeDays">
                    Reminder window (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    id="remindBeforeDays"
                    name="remindBeforeDays"
                    value={formState.remindBeforeDays}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-accent-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    placeholder="Defaults to 15"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formState.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-accent-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Internal notes (optional)"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
                <input
                  id="isActive"
                  type="checkbox"
                  name="isActive"
                  checked={formState.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-secondary-700">
                  Domain is active / allowed
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEditing ? "Update Domain" : "Add Domain"}
          </button>
        </form>

        <section className="rounded-2xl border border-secondary-200 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Allowed domains</h2>
              <p className="text-sm text-secondary-500">Track reminders, expiry, and access state in one place.</p>
            </div>
            <span className="text-sm text-secondary-500">
              {loading ? "Loading..." : `${domains.length} domain${domains.length === 1 ? "" : "s"}`}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200 text-left text-xs md:text-sm">
              <thead className="bg-secondary-50 text-[11px] uppercase tracking-wide text-secondary-600 md:text-xs">
                <tr>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 bg-white">
                {domains.length ? (
                  domains.map(renderDomainRow)
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-secondary-500" colSpan={6}>
                      {loading ? "Loading domains..." : "No domains configured yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-secondary-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Security configuration</h2>
              <p className="text-sm text-secondary-500">Review the CSP and iframe ancestry applied site-wide.</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshConfig}
              className="rounded-md border border-primary-200 px-3 py-1 text-sm font-medium text-primary-600 transition hover:bg-primary-50 disabled:opacity-60"
              disabled={previewLoading}
            >
              {previewLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {securityConfig ? (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Allowed origins</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {securityConfig.allowedOrigins?.length ? (
                    securityConfig.allowedOrigins.map((origin) => (
                      <span
                        className="inline-flex items-center rounded-full bg-secondary-100 px-3 py-1 text-xs font-medium text-secondary-700"
                        key={origin}
                      >
                        {origin}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-secondary-500">No origins configured</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Frame ancestors</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {securityConfig.frameAncestors?.length ? (
                    securityConfig.frameAncestors.map((ancestor) => (
                      <span
                        className="inline-flex items-center rounded-full bg-secondary-100 px-3 py-1 text-xs font-medium text-secondary-700"
                        key={ancestor}
                      >
                        {ancestor}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-secondary-500">No frame ancestors configured</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-secondary-50/80 p-3 text-xs text-secondary-600">
                <span className="font-semibold text-secondary-700">CSP directive:</span>
                <code className="ml-2 break-all text-[11px] text-secondary-700">
                  {securityConfig.frameAncestorsDirective}
                </code>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-secondary-500">Security configuration preview unavailable.</p>
          )}
        </section>
      </div>
    </div>
  );
}
;

export default AllowedDomains;
