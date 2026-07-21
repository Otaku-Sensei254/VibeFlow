import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";
import { FiGift, FiUserPlus, FiLoader, FiArrowRight } from "react-icons/fi";

export default function InviteLanding() {
  const { code } = useParams();
  const [inviter, setInviter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    api.get(`/users/profile/${code}`).then((res) => {
      setInviter(res.data.data?.user || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-3 sm:px-4 bg-gradient-to-br from-tide-50/50 via-white to-flow-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sun-400 to-coral-500 flex items-center justify-center shadow-lg shadow-sun-200 dark:shadow-sun-900/30">
            <FiGift className="text-white" size={28} />
          </div>

          {loading ? (
            <div className="py-8">
              <FiLoader className="animate-spin mx-auto text-tide-500" size={24} />
            </div>
          ) : (
            <>
              {inviter ? (
                <>
                  <div className="flex justify-center mb-4">
                    <img
                      src={inviter.avatar_url || `https://ui-avatars.com/api/?name=${inviter.username}&background=6366F1&color=fff`}
                      alt={inviter.username}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-md"
                    />
                  </div>
                  <h1 className="text-xl font-bold mb-1">
                    <span className="bg-gradient-to-r from-tide-600 to-flow-600 bg-clip-text text-transparent">
                      Join VibeFlow
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500 mb-6">
                    You were invited by{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">@{inviter.username}</span>
                  </p>
                  <Link
                    to={`/register?ref=${code}`}
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl font-semibold hover:from-tide-700 hover:to-flow-700 transition-all shadow-md shadow-tide-200 dark:shadow-tide-900/30"
                  >
                    <FiUserPlus size={18} />
                    Create Account
                    <FiArrowRight size={16} />
                  </Link>
                  <p className="text-xs text-gray-400 mt-4">
                    You and @{inviter.username} will both earn points when you join
                  </p>
                  <p className="text-xs text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link to={`/login?ref=${code}`} className="text-tide-600 hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold mb-1 bg-gradient-to-r from-tide-600 to-flow-600 bg-clip-text text-transparent">
                    Join VibeFlow
                  </h1>
                  <p className="text-sm text-gray-500 mb-6">
                    A new kind of social experience
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl font-semibold hover:from-tide-700 hover:to-flow-700 transition-all shadow-md shadow-tide-200 dark:shadow-tide-900/30"
                  >
                    <FiUserPlus size={18} />
                    Create Account
                  </Link>
                </>
              )}
            </>
          )}

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Link to="/feed" className="text-xs text-gray-400 hover:text-tide-600 transition">
              Browse as guest &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}