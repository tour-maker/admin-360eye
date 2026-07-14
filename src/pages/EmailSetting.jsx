import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import logo2 from "../assets/images/360eye_logo 4.png";
import { fetchEmailSettings, saveEmailSettings } from "../services/emailSettingService";

const EmailSetting = () => {
  const token = useSelector((state) => state.auth.token);

  const [senderEmail, setSenderEmail] = useState("");
  const [senderPassword, setSenderPassword] = useState("");
  const [senderDisplayName, setSenderDisplayName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [enableSSL, setEnableSSL] = useState(false);
  const [toEmail, setToEmail] = useState("");
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      if (!token) {
        setIsLoading(false);
        toast.error("Authentication required. Please log in again.");
        return;
      }

      try {
        setIsLoading(true);
        const settings = await fetchEmailSettings(token);

        if (!isMounted) return;

        if (settings) {
          setSenderEmail(settings.senderEmail || "");
          setSenderDisplayName(settings.senderDisplayName || "");
          setHost(settings.host || "");
          setPort(settings.port ? String(settings.port) : "");
          setEnableSSL(Boolean(settings.enableSSL));
          setToEmail(settings.toEmail || "");
          setHasExistingPassword(Boolean(settings.hasPassword));
          setUpdatedAt(settings.updatedAt || null);
        } else {
          setSenderEmail("");
          setSenderDisplayName("");
          setHost("");
          setPort("");
          setEnableSSL(false);
          setToEmail("");
          setHasExistingPassword(false);
          setUpdatedAt(null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load email settings", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    const numericPort = Number(port);
    if (Number.isNaN(numericPort) || numericPort <= 0) {
      toast.error("Port must be a positive number");
      return;
    }

    const payload = {
      senderEmail: senderEmail.trim(),
      senderDisplayName: senderDisplayName.trim(),
      host: host.trim(),
      port: numericPort,
      enableSSL,
      toEmail: toEmail.trim(),
    };

    if (senderPassword.trim()) {
      payload.senderPassword = senderPassword.trim();
    }

    try {
      setIsSaving(true);
      const updatedSettings = await saveEmailSettings(payload, token);

      if (updatedSettings) {
        setSenderEmail(updatedSettings.senderEmail || "");
        setSenderDisplayName(updatedSettings.senderDisplayName || "");
        setHost(updatedSettings.host || "");
        setPort(updatedSettings.port ? String(updatedSettings.port) : "");
        setEnableSSL(Boolean(updatedSettings.enableSSL));
        setToEmail(updatedSettings.toEmail || "");
        setHasExistingPassword(Boolean(updatedSettings.hasPassword));
        setUpdatedAt(updatedSettings.updatedAt || null);
      } else {
        setHasExistingPassword(Boolean(payload.senderPassword));
      }

      setSenderPassword("");
    } catch (error) {
      console.error("Failed to update email settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isSubmitDisabled = useMemo(() => isLoading || isSaving, [isLoading, isSaving]);
  const lastUpdatedLabel = useMemo(() => {
    if (!updatedAt) return null;
    try {
      return new Date(updatedAt).toLocaleString();
    } catch (_error) {
      return updatedAt;
    }
  }, [updatedAt]);

  return (
    <>
      {/* Main Content */}
      <div>
        <img src={logo2} alt="logo" className="absolute right-9 top-6" />
        <h1 className="text-2xl font-bold p-5">Change the Email Setting</h1>

        {/* Card Container */}
        <div className="max-w-2xl mx-auto bg-secondary-50 rounded-lg shadow-lg p-6 md:ml-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Email Configuration</h2>
            {lastUpdatedLabel && (
              <span className="text-sm text-gray-500">Last updated: {lastUpdatedLabel}</span>
            )}
          </div>

          {isLoading ? (
            <div className="text-center text-gray-600 py-10">Loading email settings…</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sender Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Sender Email</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter sender email"
                  required
                  disabled={isSubmitDisabled}
                />
              </div>

              {/* Sender Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Sender Password</label>
                <input
                  type="password"
                  value={senderPassword}
                  onChange={(e) => setSenderPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={hasExistingPassword ? "Leave blank to keep current password" : "Enter sender password"}
                  disabled={isSubmitDisabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {hasExistingPassword
                    ? "Leave blank to keep the existing app password."
                    : "Enter the SMTP app password."}
                </p>
              </div>

              {/* Sender Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Sender Display Name</label>
                <input
                  type="text"
                  value={senderDisplayName}
                  onChange={(e) => setSenderDisplayName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter display name"
                  required
                  disabled={isSubmitDisabled}
                />
              </div>

              {/* Host */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Host</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter host (e.g., smtp.gmail.com)"
                  required
                  disabled={isSubmitDisabled}
                />
              </div>

              {/* Port */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Port</label>
                <input
                  type="number"
                  min="1"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter port (e.g., 587)"
                  required
                  disabled={isSubmitDisabled}
                />
              </div>

              {/* Enable SSL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Enable SSL</label>
                <div className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={enableSSL}
                      onChange={(e) => setEnableSSL(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                      disabled={isSubmitDisabled}
                    />
                    <span className="ml-2">
                      {enableSSL ? "Using SSL (port 465)" : "Use STARTTLS (port 587)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* To Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Recipient</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-accent-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter recipient email"
                  required
                  disabled={isSubmitDisabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This address receives automated alerts (e.g., domain reminders) in addition to enquiry notifications.
                </p>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-primary-400 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSubmitDisabled}
                >
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default EmailSetting;
