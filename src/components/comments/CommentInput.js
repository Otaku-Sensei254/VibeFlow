import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend } from "react-icons/fi";

export default function CommentInput({ user, onSubmit, sending }) {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    onSubmit(text);
    setText("");
  };

  if (!user) {
    return (
      <div className="px-5 sm:px-7 lg:px-8 py-4 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2.5 text-sm text-tide-600 font-medium text-center bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Log in to comment
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-7 lg:px-8 py-4 border-b border-gray-100 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <img
          src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username || "?"}&background=6366F1&color=fff&bold=true`}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-tide-500/40 focus-within:border-tide-300 dark:focus-within:border-tide-600 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder-gray-400 text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="text-tide-600 hover:text-tide-700 disabled:text-gray-300 dark:disabled:text-gray-600 transition-colors shrink-0"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-tide-500 border-t-transparent" />
            ) : (
              <FiSend size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
