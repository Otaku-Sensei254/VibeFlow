import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import { FiArrowLeft, FiUser, FiLock, FiEye, FiTrash2, FiUpload, FiCheck, FiPlus } from "react-icons/fi";
import { USERNAME_STYLES, DARK_USERNAME_STYLES } from "../../constants/usernameStyles";

function SocialIcon({ platform, className = "w-5 h-5" }) {
  switch (platform) {
    case "youtube":
      return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M23.5 6.2a3.1 3.1 0 0 0-2.2-2.2C19.3 3.5 12 3.5 12 3.5s-7.3 0-9.3.5A3.1 3.1 0 0 0 .5 6.2 32.7 32.7 0 0 0 0 12a32.7 32.7 0 0 0 .5 5.8 3.1 3.1 0 0 0 2.2 2.2c2 .5 9.3.5 9.3.5s7.3 0 9.3-.5a3.1 3.1 0 0 0 2.2-2.2A32.7 32.7 0 0 0 24 12a32.7 32.7 0 0 0-.5-5.8zM9.6 15.5V8.5l6.4 3.5-6.4 3.5z" /></svg>;
    case "instagram":
      return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm5.3-.8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" /></svg>;
    case "x":
      return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L4.7 22H1.6l7.7-8.8L1 2h6.7l4.7 6.2L18.9 2zm-1.2 18h1.8L7.2 4H5.3l12.4 16z" /></svg>;
    case "twitch":
      return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4 3h16v10l-4 4h-4l-2 2H8v-2H4V3zm2 2v10h4v2l2-2h4l2-2V5H6zm5 3h2v4h-2V8zm4 0h2v4h-2V8z" /></svg>;
    case "tiktok":
      return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M15 3c.5 2.1 2.1 3.7 4.2 4.1V10a7.1 7.1 0 0 1-4.2-1.5v7.1a5.6 5.6 0 1 1-5.6-5.6c.4 0 .8 0 1.1.1v2.9a2.6 2.6 0 1 0 2.5 2.6V3h2z" /></svg>;
    case "discord":
      return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20 5.3A16 16 0 0 0 15.9 4l-.2.5a14 14 0 0 1 3.5 1.3 13 13 0 0 0-9.4 0A14 14 0 0 1 13.3 4l-.2-.5A16 16 0 0 0 4 5.3a16.9 16.9 0 0 0-2 11.3 16 16 0 0 0 4.9 2.5l1-1.6a10.6 10.6 0 0 1-2.2-1.1c.2.1.4.3.6.4a12.1 12.1 0 0 0 11.4 0l.6-.4c-.7.4-1.4.8-2.2 1.1l1 1.6a16 16 0 0 0 4.9-2.5A16.9 16.9 0 0 0 20 5.3zM9.4 14.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm5.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" /></svg>;
    default:
      return <span className="text-xs font-bold uppercase">{platform?.charAt(0) || "?"}</span>;
  }
}

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
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [socialPlatform, setSocialPlatform] = useState("youtube");
  const [socialUsername, setSocialUsername] = useState("");
  const [addingSocial, setAddingSocial] = useState(false);

  const SOCIAL_PREFIXES = {
    youtube: "youtube.com/@",
    instagram: "instagram.com/",
    x: "x.com/",
    twitch: "twitch.tv/",
    tiktok: "tiktok.com/@",
    discord: "Username: ",
  };
  const PLATFORMS = ["youtube", "instagram", "x", "twitch", "tiktok", "discord"];

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

  const addSocial = async () => {
    const platform = socialPlatform;
    const username = socialUsername.trim();
    if (!username || !platform || addingSocial) return;
    if (!["youtube","instagram","x","twitch","tiktok","discord"].includes(platform)) {
      setError(`Invalid platform: ${platform}`);
      return;
    }
    setAddingSocial(true);
    try {
      await api.post("/users/social-accounts", { platform, username });
      const res = await api.get("/users/social-accounts");
      setSocialAccounts(res.data.data?.accounts || []);
      setSocialUsername("");
      setMessage("Social account added");
    } catch (err) {
      const detail = err.response?.data?.error || (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : null);
      const received = err.response?.data?.received;
      setError(detail || (received ? `Expected platform+username, got ${JSON.stringify(received)}` : "Could not add social account"));
    }
    setAddingSocial(false);
  };

  const removeSocial = async (id) => {
    try {
      await api.delete(`/users/social-accounts/${id}`);
      const res = await api.get("/users/social-accounts");
      setSocialAccounts(res.data.data?.accounts || []);
      setMessage("Social account removed");
    } catch {
      setError("Could not remove social account");
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

  useEffect(() => {
    api.get("/users/social-accounts").then((res) => {
      setSocialAccounts(res.data.data?.accounts || []);
    }).catch(() => {});
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

      {/* Social Accounts */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <FiUser className="text-tide-600" size={18} />
          <h2 className="font-semibold text-lg">Social Accounts</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Add up to 3 socials to display on your profile and use for verification.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Social */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">
              Add Social
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSocialPlatform(p)}
                  className={`h-12 rounded-xl border text-xs font-semibold uppercase tracking-wide transition-all ${
                    socialPlatform === p
                      ? "border-tide-500/80 bg-tide-500/10 text-tide-700 dark:text-tide-300 shadow-[0_0_12px_-6px_rgba(0,168,150,0.8)]"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <span className="flex flex-col items-center justify-center gap-1">
                    <span className={`w-4 h-4 ${socialPlatform === p ? "text-tide-500" : "text-gray-400 dark:text-gray-500"}`}>
                      <SocialIcon platform={p} />
                    </span>
                    <span className="block text-[10px]">{p.toUpperCase()}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-2">
                Username
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 overflow-hidden">
                <span className="shrink-0 px-3 py-2.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/60 border-r border-gray-200 dark:border-gray-600 font-mono">
                  {SOCIAL_PREFIXES[socialPlatform] || socialPlatform + "/"}
                </span>
                <input
                  type="text"
                  value={socialUsername}
                  onChange={(e) => setSocialUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSocial()}
                  placeholder="username"
                  className="w-full px-3 py-2.5 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addSocial}
              disabled={!socialUsername.trim() || addingSocial || socialAccounts.length >= 3}
              className="mt-4 w-full py-2.5 rounded-xl bg-tide-600 text-white text-sm font-semibold hover:bg-tide-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingSocial ? "Adding..." : "+ Add Social"}
            </button>
          </div>

          {/* Linked Accounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                Linked
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">{socialAccounts.length}/3</span>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 p-4 min-h-[180px]">
              {socialAccounts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  <FiPlus size={24} className="mb-2 opacity-50" />
                  No socials linked yet
                </div>
              ) : (
                <div className="space-y-3">
                  {socialAccounts.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0">
                          <SocialIcon platform={s.platform} />
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                            {s.platform}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[140px]">
                            {s.username}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSocial(s.id)}
                        className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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