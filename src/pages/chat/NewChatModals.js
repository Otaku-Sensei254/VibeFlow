import { useState } from "react";
import { FiX, FiImage, FiAnchor, FiLoader, FiSend, FiUser, FiUsers } from "react-icons/fi";
import api from "../../utils/api";

function ModalShell({ title, subtitle, onClose, children, width = "max-w-md", bubbly = false }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full ${width} rounded-3xl shadow-2xl ${bubbly ? "" : "bg-white dark:bg-zinc-900"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {bubbly ? (
          children
        ) : (
          <div className="p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-gray-200"
              >
                <FiX size={20} />
              </button>
            </div>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function UserSearchInput({ value, onChange, placeholder = "Search username..." }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-tide-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
    />
  );
}

const DEFAULT_AVATAR = (username) => `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "U")}&background=0d9488&color=fff`;

const START_OPTIONS = [
  { key: "direct", label: "Direct Chat", desc: "Start a 1-on-1 conversation", icon: FiUser, color: "bg-tide-100 text-tide-600 dark:bg-tide-900/40 dark:text-tide-300" },
  { key: "group", label: "New Group", desc: "Chat with multiple friends", icon: FiUsers, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300" },
  { key: "bottle", label: "Throw Bottle", desc: "Send an anonymous kind message", icon: FiAnchor, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300" },
];

export function StartChatModal({ onClose, onSelect }) {
  return (
    <ModalShell title="Start a new chat" subtitle="Pick how you'd like to message." onClose={onClose} width="max-w-sm">
      <div className="space-y-2">
        {START_OPTIONS.map((o) => {
          const Icon = o.icon;
          return (
            <button
              key={o.key}
              onClick={() => onSelect(o.key)}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 px-3 py-3 text-left transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${o.color}`}>
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{o.label}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{o.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

export function DirectChatModal({ onClose, onStart }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get("/users/search", { params: { q: q.trim() } });
      setResults(res.data.data.users);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  return (
    <ModalShell title="Start a direct chat" subtitle="Search a username to begin." onClose={onClose}>
      <UserSearchInput value={query} onChange={handleSearch} />

      <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
        {searching && (
          <div className="flex justify-center py-6">
            <FiLoader className="animate-spin text-tide-500" size={20} />
          </div>
        )}
        {!searching && query.length >= 2 && results.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
            No users found.
          </p>
        )}
        {results.map((user) => (
          <button
            key={user.id}
            onClick={() => onStart(user.username)}
            className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 px-3 py-3 text-left transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <img src={user.avatar_url || DEFAULT_AVATAR(user.username)} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
              {user.email && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>}
            </div>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}

export function GroupChatModal({ onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get("/users/search", { params: { q: q.trim() } });
      setResults(res.data.data.users);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  const toggleUser = (user) => {
    setSelected((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.filter((u) => u.id !== user.id) : [...prev, user];
    });
  };

  const submit = async () => {
    if (!groupName.trim() || selected.length === 0) return;
    setSubmitting(true);
    await onCreate({ group_name: groupName.trim(), user_ids: selected.map((u) => u.id) });
    setSubmitting(false);
  };

  return (
    <ModalShell title="Create group chat" subtitle="Name the group and choose who joins." onClose={onClose} width="max-w-xl">
      <div className="space-y-4">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-tide-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100"
        />

        <UserSearchInput value={query} onChange={handleSearch} />

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((user) => (
              <span
                key={user.id}
                className="flex items-center gap-1.5 rounded-full bg-tide-100 px-3 py-1.5 text-xs font-semibold text-tide-700 dark:bg-tide-900/40 dark:text-tide-300"
              >
                <img src={user.avatar_url || DEFAULT_AVATAR(user.username)} alt="" className="h-4 w-4 rounded-full object-cover" />
                {user.username}
                <button onClick={() => toggleUser(user)} className="text-tide-600 dark:text-tide-300 hover:text-red-500">
                  <FiX size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {searching && (
            <div className="flex justify-center py-6">
              <FiLoader className="animate-spin text-tide-500" size={20} />
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
              No users found.
            </p>
          )}
          {results.map((user) => {
            const isSelected = selected.some((u) => u.id === user.id);
            return (
              <button
                key={user.id}
                onClick={() => toggleUser(user)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-tide-500 bg-tide-50 dark:border-tide-400 dark:bg-tide-900/20"
                    : "border-gray-200 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                <img src={user.avatar_url || DEFAULT_AVATAR(user.username)} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
                  {user.email && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>}
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    isSelected ? "bg-tide-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400"
                  }`}
                >
                  {isSelected ? "Selected" : "Add"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-2xl px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!groupName.trim() || selected.length === 0 || submitting}
            className="flex items-center gap-2 rounded-2xl bg-tide-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-tide-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <FiLoader className="animate-spin" size={14} />}
            Create Group
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function BottleModal({ onClose, onThrow }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.post("/uploads/media", file, {
        headers: { "Content-Type": file.type },
        params: { content_type: file.type, upload_id: `bottle-${Date.now()}` },
      });
      const url = res.data.data?.url;
      setImage(url ? { url, name: file.name } : null);
    } catch {
      setImage(null);
    }
    setUploading(false);
    e.target.value = "";
  };

  const submit = async () => {
    if (!content.trim() && !image) return;
    setSubmitting(true);
    await onThrow({
      content: content.trim(),
      media_files: image ? [{ url: image.url, type: "image" }] : [],
    });
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose} width="max-w-lg" bubbly>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-600 via-blue-500 to-cyan-400 p-5 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-20 left-[10%] h-16 w-16 animate-pulse rounded-full bg-white opacity-20" />
          <div className="absolute -bottom-20 left-[30%] h-24 w-24 animate-pulse rounded-full bg-white opacity-10" />
          <div className="absolute -bottom-20 left-[55%] h-10 w-10 animate-pulse rounded-full bg-white opacity-30" />
          <div className="absolute -bottom-20 left-[75%] h-20 w-20 animate-pulse rounded-full bg-white opacity-15" />
          <div className="absolute -bottom-20 left-[90%] h-12 w-12 animate-pulse rounded-full bg-white opacity-25" />
        </div>

        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <FiAnchor size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white drop-shadow-sm">Throw a bottle</h3>
                <p className="text-sm text-blue-100">Send something kind. One image max, up to 5 MB.</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
              <FiX size={20} />
            </button>
          </div>

          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something comforting, encouraging, or kind..."
            className="w-full resize-none rounded-2xl border-0 bg-white/90 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          />

          <div className="mt-4 rounded-2xl border border-dashed border-white/40 bg-white/10 p-4 backdrop-blur-sm">
            {image ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={image.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="truncate text-sm font-medium text-white">{image.name}</span>
                </div>
                <button onClick={() => setImage(null)} className="rounded-full p-2 text-white/70 hover:bg-white/20 hover:text-red-300 transition-colors">
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 text-sm text-white/90 hover:text-white transition-colors">
                {uploading ? (
                  <FiLoader className="animate-spin" size={18} />
                ) : (
                  <FiImage size={18} />
                )}
                {uploading ? "Uploading..." : "Attach an image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            )}
            <p className="mt-2 text-xs text-blue-100">Accepted: JPG, PNG, WEBP, GIF. Max 5 MB.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="rounded-2xl px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/20 transition-colors">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={(!content.trim() && !image) || submitting}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-lg shadow-blue-900/20 transition hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <FiLoader className="animate-spin" size={14} />
              ) : (
                <FiSend size={14} />
              )}
              Throw Bottle
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}