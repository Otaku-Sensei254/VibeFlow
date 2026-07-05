import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

export default function AdminVerifications() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/verifications", { params: { filter } });
      setRequests(res.data.data.requests);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/verifications/${id}/approve`);
      fetchRequests();
    } catch {}
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/verifications/${id}/reject`);
      fetchRequests();
    } catch {}
  };

  return (
    <>
      <div className="rounded-3xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur p-6 lg:p-8 shadow-sm mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Verification Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Approve or reject user verification requests.</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {["pending", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              filter === f
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}
          >
            {f === "pending" ? "Pending" : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 rounded-full border-[3px] border-tide-100 dark:border-tide-900/30 border-t-tide-500 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-700 py-20 text-center bg-white/50 dark:bg-zinc-900/50">
          <p className="text-gray-500 text-sm">No verification requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={req.user.avatar_url || `https://ui-avatars.com/api/?name=${req.user.username}&background=6366F1&color=fff&bold=true`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{req.user.username}</p>
                    <span className={`inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      req.status === "pending"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : req.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
                {req.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
              {req.social_links?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {req.social_links.map((link, i) => (
                    <span key={i} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">{link}</span>
                  ))}
                </div>
              )}
              {req.admin_notes && (
                <p className="mt-2 text-xs text-gray-400 italic">Note: {req.admin_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
