import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { path: "/admin/users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { path: "/admin/verifications", label: "Verifications", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { path: "/admin/roles", label: "Roles", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/feed");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/80 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800
          flex flex-col shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:shadow-lg md:z-20
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-zinc-800">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            VibeFlow Admin
          </span>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800">
            <Link
              to="/feed"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Feed
            </Link>
          </div>
        </nav>

        {user && (
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user.username}`} onClick={onClose} className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden hover:ring-2 ring-indigo-400 transition-all">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.username?.charAt(0)?.toUpperCase() || "?"}</span>
                  )}
                </div>
              </Link>
              <Link to={`/profile/${user.username}`} onClick={onClose} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{user.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.roles?.map((r) => r.name).join(", ") || "user"}
                </p>
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors shrink-0" title="Log out">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
