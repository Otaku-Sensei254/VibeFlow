import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tide-500" />
      </div>
    );
  }

  if (!user || !user.roles?.some((r) => r.name === "admin")) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
