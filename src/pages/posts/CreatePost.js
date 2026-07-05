import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";
import { FiArrowLeft, FiImage, FiX, FiFile } from "react-icons/fi";

const CATEGORIES = [
  "Tech", "Drama", "Action", "Fiction", "Music", "Fitness", "Sports",
  "Thrills", "Science", "Fashion", "Beauty", "Gossip", "Food", "Politics",
  "Business", "Comedy", "Nature", "Couples", "Kids",
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"];

export default function CreatePost() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => ACCEPTED_TYPES.includes(f.type));
    setSelectedFiles((prev) =>
      [...prev, ...valid.map((f) => ({ file: f, preview: URL.createObjectURL(f), type: f.type.startsWith("video/") ? "video" : "image" }))].slice(0, 20)
    );
    e.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadToR2 = async (blob, contentType) => {
    const res = await api.post("/uploads/media", blob, {
      headers: { "Content-Type": contentType },
      params: { content_type: contentType, upload_id: `post-${Date.now()}-${Math.random().toString(36).slice(2)}` },
    });
    return res.data.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const tags = form.tags
      ? form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    navigate("/feed");

    showToast({
      title: "Uploading...",
      message: "Your post is being published in the background.",
      type: "success",
      duration: 3000,
    });

    try {
      const mediaFiles = [];
      for (const sf of selectedFiles) {
        const resp = await fetch(sf.preview);
        const blob = await resp.blob();
        const result = await uploadToR2(blob, sf.file.type);
        mediaFiles.push({ url: result.url, type: result.resource_type || sf.type });
      }

      const res = await api.post("/posts", {
        post: { ...form, tags, media_files: mediaFiles },
      });

      showToast({
        title: "Post published!",
        message: "Your post is now live.",
        link: `/posts/${res.data.data.post.uuid}`,
        linkText: "Click to view your post",
        type: "success",
        duration: 8000,
      });
    } catch (err) {
      showToast({
        title: "Upload failed",
        message: err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : "Something went wrong. Please try again.",
        type: "error",
        duration: 8000,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm font-medium text-tide-600 hover:text-tide-700 mb-4 transition-colors">
        <FiArrowLeft size={16} /> Back to feed
      </Link>

      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-tide-600 to-flow-600 bg-clip-text text-transparent">
          Create Post
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-xl mb-5 text-sm border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Post title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm transition-all"
            required
          />
          <textarea
            placeholder="What's on your mind?"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={5}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm resize-none transition-all"
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm transition-all"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-sm transition-all"
          />

          {/* Media Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-tide-400 dark:hover:border-tide-500 hover:text-tide-600 dark:hover:text-tide-400 transition-all w-full justify-center"
            >
              <FiImage size={18} />
              Add images or videos
            </button>

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {selectedFiles.map((sf, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    {sf.type === "video" ? (
                      <video src={sf.preview} className="w-full h-full object-cover" />
                    ) : (
                      <img src={sf.preview} alt="" className="w-full h-full object-cover" />
                    )}
                    {sf.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiFile size={20} className="text-white drop-shadow-lg" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl font-semibold hover:from-tide-700 hover:to-flow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-tide-200 dark:shadow-tide-900/30"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}
