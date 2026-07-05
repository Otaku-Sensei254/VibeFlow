import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("joined_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = { sort_by: sortBy };
    if (search) params.search = search;
    const [usersRes, rolesRes] = await Promise.all([
      api.get("/admin/users", { params }).catch((e) => { console.error("Users fetch failed:", e); return null; }),
      api.get("/admin/roles").catch((e) => { console.error("Roles fetch failed:", e); return null; }),
    ]);
    if (usersRes) setUsers(usersRes.data.data.users);
    else setError("Failed to load users");
    if (rolesRes) setRoles(rolesRes.data.data.roles);
    else console.warn("Roles unavailable — role toggle buttons hidden");
    setLoading(false);
  }, [search, sortBy]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleRole = async (userId, roleId) => {
    try {
      await api.post(`/admin/users/${userId}/toggle_role/${roleId}`);
      fetchUsers();
    } catch {}
  };

  return (
    <>
      <div className="rounded-3xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur p-6 lg:p-8 shadow-sm mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search, filter, and manage user roles.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by username or bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tide-500/40"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-tide-500/40"
        >
          <option value="joined_desc">Newest First</option>
          <option value="joined_asc">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 rounded-full border-[3px] border-tide-100 dark:border-tide-900/30 border-t-tide-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border-2 border-red-200 dark:border-red-900/50 py-12 text-center bg-red-50/50 dark:bg-red-900/10">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          <button onClick={fetchUsers} className="mt-3 text-xs text-gray-500 dark:text-gray-400 hover:underline">Try again</button>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-700 py-20 text-center bg-white/50 dark:bg-zinc-900/50">
          <p className="text-gray-500 text-sm">No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=0d9488&color=fff&bold=true`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.username}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {roles.map((role) => {
                  const hasRole = user.roles?.some((r) => r.id === role.id);
                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(user.id, role.id)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                        hasRole
                          ? "bg-tide-100 text-tide-700 dark:bg-tide-900/40 dark:text-tide-300 border border-tide-200 dark:border-tide-800"
                          : "bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-gray-500 border border-gray-200 dark:border-zinc-700 hover:border-tide-200"
                      }`}
                    >
                      {role.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
