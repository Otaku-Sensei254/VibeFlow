import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import VideoPlayer from "../VideoPlayer";
import CommentSection from "./CommentSection";

export default function CurrentCommentSheet({ current, currentUser, onClose }) {
  const muted = true;
  const videoUrl = current?.media_files?.find((m) => m.type === "video")?.url || "";

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Video area — top 35% */}
      <div className="relative h-[35%] bg-black overflow-hidden">
        {videoUrl ? (
          <VideoPlayer
            src={videoUrl}
            muted={muted}
            autoPlay={true}
            loop={true}
            playsInline={true}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/40 text-sm">No video</div>
        )}
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 -ml-1">
            <FiX size={20} />
          </button>
          <Link to={`/profile/${current.user?.username}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-tide-600 dark:hover:text-tide-400 truncate">
            @{current.user?.username}
          </Link>
        </div>
        {current.title && (
          <span className="text-xs text-gray-400 truncate ml-2 hidden sm:block">{current.title}</span>
        )}
      </div>

      {/* Comments section — fills remaining space */}
      <div className="flex-1 bg-white dark:bg-gray-900 overflow-hidden">
        <CommentSection uuid={current.uuid} user={currentUser} />
      </div>
    </div>
  );
}
