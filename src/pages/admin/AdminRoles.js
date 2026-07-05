import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get("/admin/roles"),
        api.get("/admin/permissions"),
      ]);
      setRoles(rolesRes.data.data.roles);
      setPermissions(permsRes.data.data.permissions);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const createRole = async () => {
    if (!name.trim()) return;
    try {
      await api.post("/admin/roles", {
        role: { name: name.trim() },
        permission_ids: selectedPermissions,
      });
      setName("");
      setSelectedPermissions([]);
      fetchData();
    } catch {}
  };

  return (
    <>
      <div className="rounded-3xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur p-6 lg:p-8 shadow-sm mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Role Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage roles with permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Create New Role</h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Role Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. editor"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Permissions</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {permissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500/40"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{perm.name}</p>
                    <p className="text-xs text-gray-400">{perm.slug}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={createRole}
            disabled={!name.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
          >
            Create Role
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Existing Roles</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-[3px] border-tide-100 dark:border-tide-900/30 border-t-tide-500 animate-spin" />
            </div>
          ) : roles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">No roles created yet.</p>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="border border-slate-200 dark:border-zinc-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wide">{role.name}</span>
                    <span className="text-xs text-gray-400">{role.permissions?.length || 0} permissions</span>
                  </div>
                  {role.permissions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map((p) => (
                        <span key={p.id} className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
