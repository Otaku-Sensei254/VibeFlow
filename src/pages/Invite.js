import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiCopy, FiCheck, FiShare2, FiGift, FiExternalLink } from "react-icons/fi";

export default function Invite() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/invite/${user?.username || ""}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join VibeFlow",
          text: `Join me on VibeFlow — ${inviteLink}`,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sun-400 to-coral-500 flex items-center justify-center shadow-lg shadow-sun-200 dark:shadow-sun-900/30">
            <FiGift className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-sun-500 to-coral-500 bg-clip-text text-transparent">
            Invite Friends
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Share VibeFlow and earn <span className="font-semibold text-tide-600 dark:text-tide-400">50 points</span> for each friend who joins
          </p>

          <div className="max-w-md mx-auto">
            <label className="block text-xs font-medium text-gray-400 text-left mb-1.5">Your invite link</label>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 truncate select-all">
                {inviteLink}
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 p-2.5 bg-tide-600 text-white rounded-xl hover:bg-tide-700 transition-all"
                title="Copy link"
              >
                {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl font-semibold hover:from-tide-700 hover:to-flow-700 transition-all shadow-md shadow-tide-200 dark:shadow-tide-900/30"
              >
                <FiShare2 size={16} />
                Share link
              </button>
            </div>

            <div className="bg-sun-50 dark:bg-sun-900/10 border border-sun-200 dark:border-sun-800/30 rounded-xl p-4 text-left">
              <h3 className="text-sm font-semibold text-sun-700 dark:text-sun-300 mb-2 flex items-center gap-1.5">
                <FiGift size={14} /> How it works
              </h3>
              <ul className="text-xs text-sun-600 dark:text-sun-400 space-y-1.5">
                <li>1. Share your invite link with friends</li>
                <li>2. They sign up using your link</li>
                <li>3. You both earn <strong>50 points</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 px-6 sm:px-8 py-4">
          <Link
            to={`/profile/${user?.username}`}
            className="inline-flex items-center gap-1.5 text-sm text-tide-600 hover:text-tide-700 transition"
          >
            <FiExternalLink size={14} />
            Go to your profile
          </Link>
        </div>
      </div>
    </div>
  );
}