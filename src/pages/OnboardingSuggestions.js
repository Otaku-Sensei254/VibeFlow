import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FiCheck, FiUserPlus, FiSkipForward, FiLoader } from "react-icons/fi";

export default function OnboardingSuggestions() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/users/suggestions", { params: { limit: 8 } }).then((res) => {
      setUsers(res.data.data?.users || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleFollow = async (username) => {
    if (following.has(username)) {
      setFollowing((prev) => { const next = new Set(prev); next.delete(username); return next; });
    } else {
      setFollowing((prev) => new Set(prev).add(username));
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    if (following.size > 0) {
      try {
        await api.post("/users/batch-follow", { usernames: Array.from(following) });
      } catch {}
    }
    navigate("/feed", { replace: true });
  };

  const handleSkip = () => {
    navigate("/feed", { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-3 sm:px-4 bg-gradient-to-br from-tide-50/50 via-white to-flow-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-tide-500 to-flow-600 flex items-center justify-center shadow-md shadow-tide-200 dark:shadow-tide-900/30">
              <FiUserPlus className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold mb-1 bg-gradient-to-r from-tide-600 to-flow-600 bg-clip-text text-transparent">
              Find people to follow
            </h1>
            <p className="text-sm text-gray-500">
              Follow some creators to personalize your feed
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <FiLoader className="animate-spin text-tide-500" size={24} />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">No one to follow yet</p>
              <p className="text-xs text-gray-500 mb-4">Be the first to post and build the community!</p>
              <button
                onClick={handleSkip}
                className="px-6 py-2.5 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl font-semibold hover:from-tide-700 hover:to-flow-700 transition-all"
              >
                Start posting
              </button>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                >
                  <img
                    src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}&background=6366F1&color=fff`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {u.username}
                    </p>
                    {u.bio && (
                      <p className="text-xs text-gray-500 truncate">{u.bio}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFollow(u.username)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      following.has(u.username)
                        ? "bg-tide-100 dark:bg-tide-900/30 text-tide-700 dark:text-tide-300"
                        : "bg-tide-600 text-white hover:bg-tide-700"
                    }`}
                  >
                    {following.has(u.username) ? (
                      <><FiCheck size={14} /> Following</>
                    ) : (
                      <><FiUserPlus size={14} /> Follow</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {users.length > 0 && (
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
              >
                <FiSkipForward size={16} />
                Skip
              </button>
              <button
                onClick={handleContinue}
                disabled={saving}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl font-semibold hover:from-tide-700 hover:to-flow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-tide-200 dark:shadow-tide-900/30"
              >
                {saving ? "Saving..." : `Continue${following.size > 0 ? ` (${following.size})` : ""}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}