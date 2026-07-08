import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import { FiArrowLeft, FiUser, FiLock, FiEye, FiTrash2, FiUpload, FiCheck } from "react-icons/fi";
import { USERNAME_STYLES, DARK_USERNAME_STYLES } from "../../constants/usernameStyles";

export default function Settings() {
  const { user, updateUser, showPresence, setShowPresence } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    avatar_url: user?.avatar_url || "",
    username_style: user?.username_style || "none",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setUploading(true);
    try {
      let payload = { ...form };
      if (avatarFile) {
        const uploadRes = await api.post("/uploads/media", avatarFile, {
          headers: { "Content-Type": avatarFile.type },
        });
        payload.avatar_url = uploadRes.data.data.url;
      }
      const res = await api.put("/users/profile", { user: payload });
      updateUser(res.data.data.user);
      setForm((prev) => ({ ...prev, avatar_url: res.data.data.user.avatar_url || "" }));
      setAvatarFile(null);
      setMessage("Profile updated");
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(", ") : "Update failed");
    }
    setUploading(false);
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setError("Passwords do not match");
      return;
    }
    try {
      await api.put("/users/password", passwordForm);
      setMessage("Password updated");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(", ") : "Update failed");
    }
  };

  const [ownedItems, setOwnedItems] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  useEffect(() => {
    api.get("/store/items").then((res) => {
      const items = res.data.data?.items || [];
      const owned = {};
      items.forEach((item) => { owned[item.item_slug] = item.owned; });
      setOwnedItems(owned);
    }).catch(() => {}).finally(() => setInventoryLoading(false));
  }, []);

  const hasGlow = ownedItems?.["profile-glow"] === true;
  const styleMap = isDark ? DARK_USERNAME_STYLES : USERNAME_STYLES;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Link to={`/profile/${user?.username}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-tide-600 hover:text-tide-700 mb-4 transition-colors">
        <FiArrowLeft size={16} /> Back to profile
      </Link>

      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 sm:p-4 rounded-xl mb-5 text-sm border border-green-200 dark:border-green-800/50 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-xl mb-5 text-sm border border-red-200 dark:border-red-800/50">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <FiEye className="text-tide-600" size={18} />
          <h2 className="font-semibold text-lg">Privacy</h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Show online status</p>
            <p className="text-xs text-gray-500 mt-0.5">Let others see when you're active</p>
          </div>
          <button
            onClick={() => setShowPresence(!showPresence)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              showPresence ? "bg-tide-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                showPresence ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <FiUser className="text-tide-600" size={18} />
          <h2 className="font-semibold text-lg">Profile</h2>
        </div>
        <form onSubmit={updateProfile} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 ring-2 ring-gray-200 dark:ring-zinc-700">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold text-xl">
                    {user?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-tide-600 text-white flex items-center justify-center shadow-md hover:bg-tide-700 transition-colors"
              >
                <FiUpload size={11} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Avatar</p>
              <p className="text-xs text-gray-500 mt-0.5">Click the icon to upload a new photo</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            {avatarFile && (
              <button
                type="button"
                onClick={() => { setAvatarFile(null); setAvatarPreview(user?.avatar_url || null); }}
                className="text-xs text-red-500 hover:text-red-600 font-semibold"
              >
                Remove
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm transition-all"
            required
          />
          <textarea
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm resize-none transition-all"
          />

          {/* Username Style Picker */}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Username Style</p>
            {inventoryLoading ? (
              <div className="h-10 flex items-center">
                <div className="w-5 h-5 rounded-full border-2 border-tide-500 border-t-transparent animate-spin" />
              </div>
            ) : hasGlow ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {Object.keys(USERNAME_STYLES).map((key) => {
                  const previewStyle = styleMap[key] || {};
                  const selected = form.username_style === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, username_style: key })}
                      className={`relative flex items-center justify-center h-10 rounded-xl text-xs font-bold border transition-all ${
                        selected
                          ? "border-tide-500 ring-2 ring-tide-500/30 bg-tide-50 dark:bg-tide-900/20"
                          : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      style={key === "none" ? {} : previewStyle}
                      title={key}
                    >
                      {key === "none" ? "Default" : key.replace("neon-", "").replace("font-", "")}
                      {selected && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-tide-600 text-white flex items-center justify-center">
                          <FiCheck size={9} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  Unlock the Profile Glow cosmetic from the Wave Store to customize your username style!
                </p>
                <Link
                  to="/wave-store"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                >
                  Visit Wave Store →
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl font-semibold hover:from-tide-700 hover:to-flow-700 transition-all duration-200 shadow-md shadow-tide-200 dark:shadow-tide-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <FiLock className="text-tide-600" size={18} />
          <h2 className="font-semibold text-lg">Change Password</h2>
        </div>
        <form onSubmit={updatePassword} className="space-y-4">
          <input
            type="password"
            placeholder="Current password"
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm transition-all"
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={passwordForm.password}
            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm transition-all"
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordForm.password_confirmation}
            onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm transition-all"
            required
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl font-semibold hover:from-tide-700 hover:to-flow-700 transition-all duration-200 shadow-md shadow-tide-200 dark:shadow-tide-900/30"
          >
            Update Password
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm p-5 sm:p-6 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <FiTrash2 className="text-red-500" size={18} />
          <h2 className="font-semibold text-lg text-red-600 dark:text-red-400">Delete Account</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
          To request deletion, email us at{" "}
          <a href="mailto:vibeflowtech@gmail.com" className="text-tide-600 hover:underline font-medium">vibeflowtech@gmail.com</a>{" "}
          from the email address linked to your account. We will process your request within 30 days.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          See our{" "}
          <Link to="/privacy" className="text-tide-600 hover:underline">Privacy Policy</Link>{" "}
          for more details on data retention.
        </p>
      </div>
    </div>
  );
}