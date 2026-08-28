import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { USERNAME_STYLES, DARK_USERNAME_STYLES } from "../../constants/usernameStyles";
import api from "../../utils/api";
import { driftApi } from "../../utils/api";
import { joinChannel, leaveChannel, onChannel } from "../../utils/realtime";
import { showToast } from "../../utils/toast";
import CustomVideoPlayer from "../../components/CustomVideoPlayer";
import { StartChatModal, DirectChatModal, GroupChatModal, BottleModal } from "./NewChatModals";
import DriftModal from "../../components/DriftModal";
import { GiBigWave } from "react-icons/gi";
import { TbMessage2Plus } from "react-icons/tb";
import {
  FiSend, FiSearch, FiArrowLeft, FiUser, FiUsers,
  FiMessageCircle, FiAnchor, FiSmile, FiMic, FiStopCircle,
  FiImage, FiX, FiPlay, FiPause, FiSettings, FiPhone,
  FiPhoneOff, FiVolume2, FiTrash2, FiCheck, FiCheckCircle,
  FiMoreHorizontal, FiEdit3, FiStar, FiCornerUpLeft, FiChevronDown,
} from "react-icons/fi";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import verified from "../../components/images/vibeflow_verified2.png";


const TABS = [
  { key: "all", label: "All", icon: FiMessageCircle },
  { key: "direct", label: "Direct", icon: FiUser },
  { key: "groups", label: "Groups", icon: FiUsers },
  { key: "bottles", label: "Bottles", icon: FiAnchor },
];

const CONVO_ICONS = {
  direct: FiUser,
  group: FiUsers,
  bottle: FiAnchor,
};

const SKIN_CLASSES = {
  default: { sent: "bg-tide-600 text-white", received: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" },
  glassmorphism: { sent: "bg-white/20 backdrop-blur-xl border border-white/30 text-gray-900 dark:text-white shadow-lg", received: "bg-white/10 backdrop-blur-xl border border-white/20 text-gray-900 dark:text-gray-100 shadow-lg" },
  matrix: { sent: "bg-green-900/80 text-green-300 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]", received: "bg-green-950/80 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]" },
  holographic: { sent: "bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]", received: "bg-gradient-to-br from-purple-900/80 via-pink-800/80 to-cyan-800/80 text-white border border-purple-400/30" },
  vantablack: { sent: "bg-gray-950 text-gray-200 border border-gray-800 shadow-lg", received: "bg-gray-950 text-gray-300 border border-gray-800 shadow-lg" },
};

const SKIN_BUBBLE_CLASSES = {
  default: "rounded-br-md rounded-bl-md",
  glassmorphism: "rounded-br-md rounded-bl-md",
  matrix: "rounded-br-md rounded-bl-md border",
  holographic: "rounded-br-md rounded-bl-md border border-white/10",
  vantablack: "rounded-br-md rounded-bl-md border",
};

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z")
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  const today = new Date();
  const normalize = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diffDays = Math.round((normalize(today) - normalize(d)) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return d.toLocaleDateString([], { weekday: "long" });
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  const da = new Date(a.endsWith("Z") ? a : a + "Z");
  const db = new Date(b.endsWith("Z") ? b : b + "Z");
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function getMediaType(mime) {
  if (!mime) return "file";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "file";
}

export function buildDummyDrifts(currentUser = null) {
  const now = Date.now();
  const currentUserDrift = currentUser
    ? {
      id: `drift-me-${currentUser.id || "current"}`,
      user_id: currentUser.id || "me",
      username: currentUser.username || "You",
      avatar_url: currentUser.avatar_url || null,
      content: "Feeling off today...",
      type: "text",
      created_at: new Date(now).toISOString(),
      isCurrentUser: true,
    }
    : null;

  const friends = [
    { username: "alex_", avatar_url: null, content: "Nyi weni mko in love kwa..." },
    { username: "sarah_k", avatar_url: null, content: "Do what u gotta do" },
    { username: "mike_d", avatar_url: null, content: "Him n I" },
    { username: "jessica_l", avatar_url: null, content: "Making the most of today" },
    { username: "chris_p", avatar_url: null, content: "Weekend mode activated" },
    { username: "nina_", avatar_url: null, content: "Just vibing right now" },
  ];

  const mappedFriends = friends.map((friend, index) => ({
    id: `drift-${friend.username}-${index}-${now}`,
    user_id: 100 + index,
    username: friend.username,
    avatar_url: friend.avatar_url,
    content: friend.content,
    type: "text",
    created_at: new Date(now - (index + 1) * 60 * 60 * 1000).toISOString(),
    isCurrentUser: false,
  }));

  return currentUserDrift ? [currentUserDrift, ...mappedFriends] : mappedFriends;
}

function AvatarWithStatus({ src, username, size = "w-10 h-10", online = false }) {
  return (
    <div className={`${size} relative shrink-0`}>
      {src ? (
        <img src={src} alt={username} className={`${size} rounded-full object-cover`} />
      ) : (
        <div className={`${size} rounded-full bg-gradient-to-br from-tide-400 to-flow-500 flex items-center justify-center text-white font-bold text-sm`}>
          {(username || "U").charAt(0).toUpperCase()}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
      )}
    </div>
  );
}

function ConversationAvatar({ conv, size = "w-10 h-10", online = false, isFound }) {
  if (conv.type === "group") {
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-tide-400 to-flow-500 flex items-center justify-center text-white font-bold text-sm shrink-0`}>
        {(conv.name || "G").charAt(0).toUpperCase()}
      </div>
    );
  }
  if (conv.type === "bottle" && !isFound) {
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm shrink-0 relative`}>
        <FiAnchor size={size === "w-10 h-10" ? 18 : 14} />
        {online && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
        )}
      </div>
    );
  }
  return (
    <AvatarWithStatus
      src={conv.other_user?.avatar_url}
      username={conv.other_user?.username}
      size={size}
      online={online}
    />
  );
}

// ─── WavePlayer (Audio Message Player) ────────────────────────
function WavePlayer({ url, sentByMe }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); }
    else { audioRef.current.play().catch(() => { }); }
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    if (progressRef.current) {
      const pct = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
      progressRef.current.style.width = `${pct}%`;
    }
  };

  const onLoaded = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 min-w-[180px] max-w-full ${sentByMe ? "bg-tide-700" : "bg-gray-100 dark:bg-gray-700"}`}>
      <audio ref={audioRef} src={url} preload="auto" onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoaded} onEnded={() => setPlaying(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button onClick={toggle} className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
        {playing ? <FiPause size={14} className="text-white" /> : <FiPlay size={14} className="text-white ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
          <div ref={progressRef} className="h-full rounded-full bg-white w-0 transition-all" />
        </div>
      </div>
      <span className="text-[10px] opacity-70 font-mono w-8 text-right shrink-0">{fmt(playing ? currentTime : duration)}</span>
    </div>
  );
}

// ─── Shared Post Card ─────────────────────────────────────────
function SharedPostCard({ post }) {
  if (!post) return null;
  const mediaUrl = post.first_media?.url;
  const isVideo = post.first_media?.type === "video";
  const truncatedContent = post.content && post.content.length > 80 ? post.content.substring(0, 80) + "..." : post.content;
  return (
    <Link to={`/posts/${post.uuid || post.id}`} className="block w-64 aspect-[9/16] rounded-2xl overflow-hidden shadow-md transition-transform hover:scale-[1.02] border border-gray-200 dark:border-zinc-800 relative">
      {mediaUrl ? (
        <>
          {isVideo ? (
            <video src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay playsInline />
          ) : (
            <img src={mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 p-4">
          <p className="text-xs text-gray-500 line-clamp-3 text-center italic">{post.content}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
      {post.user && (
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <img src={post.user.avatar_url || `https://ui-avatars.com/api/?name=${post.user.username}&background=0d9488&color=fff`} alt="" className="w-6 h-6 rounded-full border border-white/50 object-cover" />
          <span className="text-xs font-bold text-white shadow-sm">{post.user.username}</span>
        </div>
      )}
      {truncatedContent && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-xs text-white/90 font-medium drop-shadow-md break-words">{truncatedContent}</p>
        </div>
      )}
    </Link>
  );
}

// ─── Shared Wave Card ─────────────────────────────────────────
function SharedWaveCard({ wave }) {
  if (!wave) return null;
  return (
    <Link to={`/waves/view/${wave.user?.username}`} className="block w-56 aspect-[9/16] rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02] border border-white/20 relative">
      {wave.media_type === "video" ? (
        <video src={wave.media_url} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay playsInline />
      ) : (
        <img src={wave.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
        {wave.user?.avatar_url ? (
          <img src={wave.user.avatar_url} alt="" className="w-5 h-5 rounded-full border border-white/50 object-cover" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] border border-white/50">
            {wave.user?.username?.charAt(0) || "W"}
          </div>
        )}
        <span className="text-[10px] font-bold text-white shadow-sm">{wave.user?.username}</span>
      </div>
      <div className="absolute top-2 right-2 z-10">
        <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-[9px] font-bold text-white uppercase tracking-wider shadow-lg">Wave</span>
      </div>
      {wave.caption && (
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="text-[10px] text-white/90 font-medium drop-shadow-md break-words line-clamp-2">{wave.caption}</p>
        </div>
      )}
    </Link>
  );
}

// ─── Chat Settings Modal ──────────────────────────────────────
const SKINS = [
  { id: "default", name: "Default", desc: "Classic clean look", price: "Free", color: "bg-blue-600", border: "border-blue-400" },
  { id: "glassmorphism", name: "Glassmorphism Pro", desc: "Frosted glass effect", price: "1200 waves", color: "bg-white/20 backdrop-blur", border: "border-white/30" },
  { id: "matrix", name: "Matrix Rain", desc: "Digital code rain", price: "2500 waves", color: "bg-green-900", border: "border-green-500/50" },
  { id: "holographic", name: "Holographic Foil", desc: "Rainbow gradient", price: "3500 waves", color: "bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500", border: "border-purple-400/30" },
  { id: "vantablack", name: "Vantablack", desc: "Light absorbing black", price: "5000 waves", color: "bg-gray-950", border: "border-gray-800" },
];

function ChatSettingsModal({ isOpen, onClose, currentSkin, onSelect }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chat Settings</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
            <FiX size={20} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Message Skins</p>
          <div className="grid grid-cols-2 gap-3">
            {SKINS.map((skin) => {
              const isActive = currentSkin === skin.id;
              const isDefault = skin.id === "default";
              return (
                <button key={skin.id} onClick={() => onSelect(skin.id)}
                  className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${isActive ? `${skin.border} ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-zinc-900` : "border-gray-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600"}`}
                >
                  <div className={`h-20 ${skin.color} ${skin.id === "glassmorphism" ? "backdrop-blur-xl" : ""} flex items-center justify-center`}>
                    <div className="space-y-1">
                      <div className={`h-2 w-16 rounded-full ${skin.id === "default" ? "bg-white/80" : "bg-white/40"}`} />
                      <div className={`h-2 w-10 rounded-full ${skin.id === "default" ? "bg-white/60" : "bg-white/20"}`} />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{skin.name}</p>
                      {!isDefault && <span className="shrink-0 text-[10px] font-semibold text-amber-600 dark:text-amber-400">{skin.price}</span>}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{skin.desc}</p>
                    {isActive && <span className="inline-block mt-2 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Active</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
function MessageBubble({ msg, isMe, skin = "default", onImageClick, onReply, onDelete, onEdit, onStar, isStarred, menuOpen, onToggleMenu }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const isBottle = msg.is_bottle;
  const isFound = msg.is_found;
  const isAnonymous = isBottle && !isFound && !isMe;

  const skinStyles = SKIN_CLASSES[skin] || SKIN_CLASSES.default;
  const bubbleExtra = SKIN_BUBBLE_CLASSES[skin] || SKIN_BUBBLE_CLASSES.default;
  const bubbleSkin = isMe ? skinStyles.sent : skinStyles.received;

  const startEdit = () => {
    setEditText(msg.content || "");
    setEditing(true);
    onToggleMenu?.(null);
  };

  const saveEdit = () => {
    if (editText.trim() && editText !== msg.content) {
      onEdit?.(msg, editText);
    }
    setEditing(false);
  };

  const closeMenu = () => onToggleMenu?.(null);

  return (
    <div className="group flex items-end gap-1.5 relative">
      {/* Received avatar */}
      {!isMe && (
        isAnonymous ? (
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold mb-1 shrink-0">
            <FiAnchor size={10} />
          </div>
        ) : (
          <img
            src={msg.user?.avatar_url || `https://ui-avatars.com/api/?name=${msg.user?.username || "U"}&background=0d9488&color=fff`}
            alt=""
            className="w-5 h-5 rounded-full mb-1 shrink-0"
          />
        )
      )}

      <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isMe ? "items-end ml-auto" : "items-start"}`}>
        {/* Floating actions (visible on hover, like LiveView) */}
        <div className={`relative mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isMe ? "self-end" : "self-start"}`}>
          <button
            onClick={() => { onReply?.(msg); }}
            className="p-1 text-gray-400 hover:text-tide-600 dark:hover:text-tide-400 rounded transition-colors"
            title="Reply"
          >
            <FiCornerUpLeft size={13} />
          </button>
          <button onClick={() => onToggleMenu?.(menuOpen ? null : msg.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors" title="More">
            <FiMoreHorizontal size={13} />
          </button>
          {menuOpen && (
            <div className={`absolute ${isMe ? "right-0 top-full" : "left-0 top-full"} mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]`} onClick={(e) => e.stopPropagation()}>
              {isMe && (
                <button onClick={startEdit} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <FiEdit3 size={12} /> Edit
                </button>
              )}
              <button onClick={() => { onDelete?.(msg); closeMenu(); }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-500">
                <FiTrash2 size={12} /> Delete
              </button>
              <button onClick={() => { onStar?.(msg); closeMenu(); }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FiStar size={12} className={isStarred ? "text-amber-400 fill-amber-400" : ""} /> {isStarred ? "Unstar" : "Star"}
              </button>
            </div>
          )}
        </div>

        {/* Reply preview */}
        {msg.reply_to && (
          <div className={`mb-2 rounded-lg px-3 py-2 text-xs border-l-4 ${isMe ? "bg-blue-300/40 dark:bg-blue-400/30 border-blue-300 text-blue-800 dark:text-blue-100" : "bg-gray-100 dark:bg-gray-600/40 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200"}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <svg className="w-3 h-3 opacity-70 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a5 5 0 015 5v2.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L15 12.586V12a3 3 0 00-3-3H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <p className="text-[10px] font-semibold opacity-80">{msg.reply_to.user?.username || "Someone"}</p>
            </div>
            <p className="text-xs leading-snug break-words whitespace-pre-wrap line-clamp-2 opacity-90">{msg.reply_to.content ? (msg.reply_to.content.length > 110 ? msg.reply_to.content.substring(0, 110) + "..." : msg.reply_to.content) : (msg.reply_to.media_files?.length > 0 ? "[Media]" : "")}</p>
          </div>
        )}

        {/* Shared Post */}
        {msg.shared_post && <div className="mb-1.5"><SharedPostCard post={msg.shared_post} /></div>}

        {/* Shared Wave */}
        {msg.shared_wave && <div className="mb-1.5"><SharedWaveCard wave={msg.shared_wave} /></div>}

        {/* Media Files */}
        {msg.media_files?.length > 0 && (
          <div className={`space-y-1 mb-1.5`}>
            {msg.media_files.map((media, i) => {
              if (media.type === "image") {
                return (
                  <button key={i} type="button" onClick={(e) => { e.preventDefault(); onImageClick?.(media.url); }}
                    className="p-0 border-0 bg-transparent cursor-zoom-in block"
                  >
                    <img src={media.url} alt="" className="max-w-[240px] rounded-xl border object-cover hover:opacity-90 transition-opacity" />
                  </button>
                );
              }
              if (media.type === "video") {
                return (
                  <CustomVideoPlayer
                    key={i}
                    src={media.url}
                    useAutoplay={false}
                    className="max-w-[240px] rounded-xl border border-white/10"
                  />
                );
              }
              if (media.type === "audio") {
                return <WavePlayer key={i} url={media.url} sentByMe={isMe} />;
              }
              return (
                <a key={i} href={media.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm text-tide-600 dark:text-tide-400 hover:bg-gray-50 transition-colors">
                  <FiImage size={16} /> File
                </a>
              );
            })}
          </div>
        )}

        {/* Text bubble or edit input */}
        {editing ? (
          <div className="flex items-end gap-2 w-full">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-tide-500 outline-none resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); }
                if (e.key === "Escape") setEditing(false);
              }}
              autoFocus
            />
            <button onClick={saveEdit} className="shrink-0 p-2 text-tide-600 hover:text-tide-700 dark:text-tide-400 dark:hover:text-tide-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FiCheck size={16} />
            </button>
          </div>
        ) : (
          msg.content && (
            <div className={`relative px-3 py-2 rounded-2xl ${bubbleSkin} ${bubbleExtra} max-w-full break-words`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          )
        )}

        {/* Timestamp + Read receipt + Star */}
        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "flex-row" : "flex-row-reverse"}`}>
          {isStarred && <FiStar size={10} className="text-amber-400 fill-amber-400" />}
          <span className="text-[10px] text-gray-400">{formatTime(msg.inserted_at)}</span>
          {isMe && (
            msg.is_read
              ? <FiCheckCircle size={12} className="text-green-500" />
              : <FiCheck size={12} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Voice Call Modal ──────────────────────────────────────────
function VoiceCallModal({ onClose, otherUser }) {
  const timerRef = useRef(null);
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    timerRef.current = setInterval(() => setCallTime((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-gray-900 text-white rounded-3xl p-8 w-80 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <AvatarWithStatus src={otherUser?.avatar_url} username={otherUser?.username} size="w-16 h-16" />
        <h3 className="text-lg font-bold mt-3">{otherUser?.username || "Unknown"}</h3>
        <p className="text-sm text-gray-400 mt-1">{fmt(callTime)}</p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
            <FiVolume2 size={20} />
          </button>
          <button onClick={onClose} className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg">
            <FiPhoneOff size={24} />
          </button>
          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
            <FiMic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Switch Account Modal ─────────────────────────────────────
function AccountsModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Switch account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Accounts linked to your email</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-gray-200">
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-3 py-3 dark:border-zinc-700">
            <AvatarWithStatus src={user?.avatar_url} username={user?.username} size="w-10 h-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.username}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-tide-100 px-2 py-0.5 text-[10px] font-bold text-tide-700 dark:bg-tide-900/40 dark:text-tide-300">
              Current
            </span>
          </div>

          <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-4 text-center text-xs text-gray-500 dark:border-zinc-700 dark:text-gray-400">
            Creation of multiple accounts coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Chat Component ──────────────────────────────────────
export default function Chat() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { user, onlineUsers, sidebarRefresh, showPresence } = useAuth();
  const { theme } = useTheme();

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showCall, setShowCall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showBottleModal, setShowBottleModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [myMessageSkin, setMyMessageSkin] = useState("default");
  const [otherUserMessageSkin, setOtherUserMessageSkin] = useState("default");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [starredMessages, setStarredMessages] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [drifts, setDrifts] = useState([]);
  const [selectedDrift, setSelectedDrift] = useState(null);
  const [showCreateDrift, setShowCreateDrift] = useState(false);
  const [newDriftText, setNewDriftText] = useState('');

  // Audio recording state
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const textareaRef = useRef(null);
  const sendingRef = useRef(false);
  const prevMsgCountRef = useRef(0);
  const prevTopicRef = useRef(null);
  const channelCleanupRef = useRef([]);

  // ── Fetch unread counts ──
  const fetchCounts = useCallback(async () => {
    try { await api.get("/chat/unread-count"); } catch { }
  }, []);

  // ── Load conversations ──
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data.data.conversations);
    } catch { }
    setLoading(false);
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (sidebarRefresh > 0) loadConversations();
  }, [sidebarRefresh, loadConversations]);

  // ── Open conversation ──
  const openConversation = useCallback(async (conv) => {
    setActiveConvo(conv);
    setUploadedFiles([]);
    setReplyingTo(null);

    // Leave previous conversation channel
    if (prevTopicRef.current) leaveChannel(prevTopicRef.current);
    channelCleanupRef.current.forEach((fn) => fn());
    channelCleanupRef.current = [];

    const topic = `conversation:${conv.uuid}`;
    joinChannel(topic, {});
    prevTopicRef.current = topic;

    // Listen for read receipts from the other user
    onChannel(topic, "message_read", (payload) => {
      if (payload.user_id && payload.user_id !== user?.id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (!m.is_read && m.user_id === user?.id) {
              const msgTime = new Date(m.inserted_at).getTime();
              const readTime = new Date(payload.last_read_at).getTime();
              if (msgTime <= readTime) return { ...m, is_read: true };
            }
            return m;
          })
        );
      }
    });

    // Listen for new messages in real-time
    onChannel(topic, "new_message", (payload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, payload];
      });
      if (payload.user_id && payload.user_id !== user?.id) {
        api.post(`/chat/conversations/${conv.uuid}/read`).catch(() => { });
      }
    });

    // Listen for message deletions
    onChannel(topic, "message_deleted", (payload) => {
      setMessages((prev) => prev.filter((m) => m.id !== payload.id));
    });

    // Listen for skin changes
    onChannel(topic, "skin_changed", (payload) => {
      if (payload.user_id === user?.id) {
        setMyMessageSkin(payload.skin);
      } else {
        setOtherUserMessageSkin(payload.skin);
      }
    });

    // Listen for message edits
    onChannel(topic, "message_updated", (payload) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.id ? { ...m, content: payload.content, updated_at: payload.updated_at } : m
        )
      );
    });

    // Listen for bottle found broadcast
    onChannel(topic, "bottle_found", (payload) => {
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === payload.message_id ? { ...m, is_found: true } : m
        );
        // Reload full message list to reflect the reveal
        api.get(`/chat/conversations/${conv.uuid}/messages`).then((res) => {
          setMessages(res.data.data.messages);
        }).catch(() => {});
        return updated;
      });
    });

    try {
      const [msgRes] = await Promise.all([
        api.get(`/chat/conversations/${conv.uuid}/messages`),
        api.post(`/chat/conversations/${conv.uuid}/read`),
      ]);
      setMessages(msgRes.data.data.messages);

      // If this is a bottle conversation and current user is not the sender,
      // trigger bottle reveal
      if (conv.type === "bottle") {
        const hasUnfoundBottle = msgRes.data.data.messages.some(
          (m) => m.is_bottle && !m.is_found && m.user_id !== user?.id
        );
        if (hasUnfoundBottle) {
          api.post(`/chat/conversations/${conv.uuid}/reveal-bottle`).then((res) => {
            setMessages(res.data.data.messages);
          }).catch(() => {});
        }
      }

      fetchCounts();
    } catch { }
  }, [fetchCounts, user?.id]);

  // ── Sync URL param to active conversation ──
  const prevUuidRef = useRef(null);
  useEffect(() => {
    if (!uuid || conversations.length === 0) {
      if (!uuid) setActiveConvo(null);
      return;
    }
    const match = conversations.find((c) => c.uuid === uuid);
    if (match && prevUuidRef.current !== uuid) {
      prevUuidRef.current = uuid;
      openConversation(match);
    }
  }, [uuid, conversations, openConversation]);

  // ── Auto scroll to bottom ──
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const isNew = messages.length === prevMsgCountRef.current + 1;
      messagesEndRef.current.scrollIntoView({ behavior: isNew ? "smooth" : "auto" });
      prevMsgCountRef.current = messages.length;
    }
  }, [messages]);

  // ── Sync per-user per-conversation skins from activeConvo ──
  useEffect(() => {
    setMyMessageSkin(activeConvo?.message_skin || "default");
    setOtherUserMessageSkin(activeConvo?.other_user_message_skin || "default");
  }, [activeConvo, setMyMessageSkin, setOtherUserMessageSkin]);

  useEffect(() => {
    const fetchDrifts = async () => {
      try {
        const response = await driftApi.getFeed();
        setDrifts(response);
      } catch (error) {
        console.error('Failed to fetch drifts:', error);
        setDrifts(buildDummyDrifts(user)); // fallback to dummy data on error
      }
    };

    fetchDrifts();
    const interval = setInterval(fetchDrifts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ── Close emoji picker / menu on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Cleanup conversation channel on unmount or uuid change ──
  useEffect(() => {
    return () => {
      if (prevTopicRef.current) {
        leaveChannel(prevTopicRef.current);
        prevTopicRef.current = null;
      }
    };
  }, [uuid]);

  // ── Navigation ──
  const handleSelectConvo = (conv) => navigate(`/chat/${conv.uuid}`);
  const handleBack = () => navigate("/chat");

  // ── Send message ──
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!activeConvo) return;
    if (!messageText.trim() && uploadedFiles.length === 0) return;
    if (sendingRef.current) return;
    sendingRef.current = true;

    const payload = { message: { content: messageText || "" } };
    if (uploadedFiles.length > 0) payload.message.media_files = uploadedFiles;
    if (replyingTo) payload.message.reply_to_id = replyingTo.id;

    try {
      const res = await api.post(`/chat/conversations/${activeConvo.uuid}/messages`, payload);
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.data.message.id)) return prev;
        return [...prev, res.data.data.message];
      });
      setMessageText("");
      setUploadedFiles([]);
      setReplyingTo(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch { }
    sendingRef.current = false;
  };

  // ── Auto-resize textarea ──
  const autoResize = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  // ── Reply ──
  const handleReply = (msg) => {
    setReplyingTo(msg);
  };

  const handleClearReply = () => {
    setReplyingTo(null);
  };

  // ── Delete message ──
  const handleDeleteMessage = async (msg) => {
    if (!activeConvo || msg.user_id !== user?.id) return;
    try {
      await api.delete(`/chat/conversations/${activeConvo.uuid}/messages/${msg.id}`);
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      if (replyingTo?.id === msg.id) setReplyingTo(null);
    } catch { }
  };

  // ── Update skin ──
  const updateSkin = async (skin) => {
    if (!activeConvo) return;
    try {
      await api.put(`/chat/conversations/${activeConvo.uuid}/skin`, { skin });
      setMyMessageSkin(skin);
    } catch { }
  };

  // ── Edit message ──
  const handleEditMessage = async (msg, newContent) => {
    if (!activeConvo || msg.user_id !== user?.id) return;
    try {
      await api.put(`/chat/conversations/${activeConvo.uuid}/messages/${msg.id}`, { content: newContent });
    } catch { }
  };

  // ── Star / Unstar message ──
  const handleStarMessage = (msg) => {
    setStarredMessages((prev) => {
      const next = new Set(prev);
      if (next.has(msg.id)) next.delete(msg.id);
      else next.add(msg.id);
      return next;
    });
  };

  // ── Search users ──
  const searchUsers = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await api.get("/users/search", { params: { q } });
      setSearchResults(res.data.data.users);
    } catch { }
  };

  // ── Start conversation ──
  // const startConversation = async (username) => {
  //   try {
  //     const res = await api.post(`/chat/start/${username}`);
  //     setSearchQuery("");
  //     setSearchResults([]);
  //     loadConversations();
  //     navigate(`/chat/${res.data.data.conversation.uuid}`);
  //   } catch { }
  // };

  // ── New chat actions / modals ──
  const handleNewChatSelect = (action) => {
    setShowStartModal(false);
    if (action === "direct") setShowDirectModal(true);
    else if (action === "group") setShowGroupModal(true);
    else if (action === "bottle") setShowBottleModal(true);
  };

  const handleStartDirectChat = async (username) => {
    try {
      const res = await api.post(`/chat/start/${username}`);
      setShowDirectModal(false);
      loadConversations();
      navigate(`/chat/${res.data.data.conversation.uuid}`);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to start chat";
      showToast({ type: "error", title: "Couldn't start chat", message: msg });
    }
  };

  const handleCreateGroup = async (payload) => {
    try {
      const res = await api.post(`/chat/groups`, payload);
      setShowGroupModal(false);
      loadConversations();
      showToast({ type: "success", title: "Group created", message: `Group "${payload.group_name}" is ready!` });
      navigate(`/chat/${res.data.data.conversation.uuid}`);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to create group";
      showToast({ type: "error", title: "Couldn't create group", message: msg });
    }
  };

  const handleThrowBottle = async (payload) => {
    try {
      const res = await api.post(`/chat/bottles`, { bottle: payload });
      setShowBottleModal(false);
      loadConversations();
      showToast({ type: "success", title: "Bottle thrown", message: "Your bottle is out at sea." });
      navigate(`/chat/${res.data.data.conversation.uuid}`);
    } catch (err) {
      const msg = err.response?.data?.error || "Couldn't throw your bottle";
      showToast({ type: "error", title: "Uh oh", message: msg });
    }
  };

  // ── Emoji insert ──
  const onEmojiSelect = (emoji) => {
    setMessageText((prev) => prev + emoji.native);
    setShowEmoji(false);
  };

  // ── File upload ──
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const res = await api.post("/uploads/media", file, {
            headers: { "Content-Type": file.type },
            params: { content_type: file.type, upload_id: `chat-${Date.now()}-${file.name}` },
          });
          const url = res.data.data?.url;
          return url ? { url, type: getMediaType(file.type) } : null;
        })
      );
      setUploadedFiles((prev) => [...prev, ...results.filter(Boolean)]);
    } catch { }
    setUploading(false);
    e.target.value = "";
  };

  const removeUploadedFile = (idx) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Audio Recording ──
  const startRecording = async () => {
    if (!activeConvo) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      source.connect(analyserRef.current);

      const mimeType = MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
        ? "audio/ogg;codecs=opus"
        : "audio/webm;codecs=opus";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const ext = mimeType.includes("webm") ? "webm" : "ogg";
        const file = new File([blob], `voice_${Date.now()}.${ext}`, { type: mimeType });
        audioChunksRef.current = [];

        setUploading(true);
        try {
          const uploadRes = await api.post("/uploads/media", file, {
            headers: { "Content-Type": file.type },
            params: { content_type: file.type, upload_id: `voice-${Date.now()}` },
          });
          const url = uploadRes.data.data?.url;
          if (url && activeConvo) {
            const payload = { message: { content: "", media_files: [{ url, type: "audio" }] } };
            if (replyingTo) payload.message.reply_to_id = replyingTo.id;
            const msgRes = await api.post(`/chat/conversations/${activeConvo.uuid}/messages`, payload);
            setMessages((prev) => [...prev, msgRes.data.data.message]);
            setReplyingTo(null);
          }
        } catch { }
        setUploading(false);
        cleanupRecording();
      };

      recorder.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const cleanupRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    setRecording(false);
    setRecordingTime(0);
    mediaRecorderRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
  };

  const fmtRecTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Derived ──
  const filteredConvos = conversations.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "direct") return c.type === "direct";
    if (activeTab === "groups") return c.type === "group";
    if (activeTab === "bottles") return c.type === "bottle";
    return true;
  });

  const activeConvoDisplayName = activeConvo
    ? activeConvo.type === "direct"
      ? activeConvo.other_user?.username || "Unknown"
      : activeConvo.type === "bottle"
        ? (() => {
            const found = messages.some((m) => m.is_bottle && m.is_found);
            return found && activeConvo.other_user?.username
              ? activeConvo.other_user.username
              : "Message in a Bottle";
          })()
        : activeConvo.name || "Unknown"
    : "";

  const isDirectChat = activeConvo?.type === "direct" || activeConvo?.type === "bottle";
  const otherUserOnline = isDirectChat && showPresence && onlineUsers[String(activeConvo?.other_user?.id)];
  const showSidebar = !uuid;
  const showChat = !!uuid;

  const glowOwned = !!user?.glow;
  const usernameStyleKey =
    glowOwned || !!user?.username_style ? user?.username_style || "neon-green" : "none";
  const usernameStyleMap = theme === "dark" ? DARK_USERNAME_STYLES : USERNAME_STYLES;
  const usernameStyle = usernameStyleMap[usernameStyleKey] || usernameStyleMap["none"] || {};
  const filteredDrifts = drifts
    .filter((d) => Date.now() - new Date(d.inserted_at).getTime() < 24 * 60 * 60 * 1000)
    .sort((a, b) => {
      // Logged-in user's drift always first
      const aIsCurrentUser = a.user?.id === user?.id;
      const bIsCurrentUser = b.user?.id === user?.id;
      if (aIsCurrentUser && !bIsCurrentUser) return -1;
      if (!aIsCurrentUser && bIsCurrentUser) return 1;
      // Then sort by inserted_at descending (most recent first)
      return new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime();
    });
  
  
  const handleCreateDrift = async () => {
    if (!newDriftText.trim()) return;
    try {
      const created = await driftApi.create({ note: newDriftText.trim() });
      setDrifts(prev => [created, ...prev]);
      setShowCreateDrift(false);
      setNewDriftText('');
      setSelectedDrift(created);
    } catch (error) {
      console.error('Failed to create drift:', error);
      showToast({
        title: "Error",
        message: "Failed to create drift. Please try again.",
        type: "error"
      });
    }
  };

  const currentUserHasDrift = filteredDrifts.some(d => d.user?.id === user?.id);

  return (
    <div className="flex h-dvh overflow-hidden bg-white dark:bg-gray-900">
      {/* ─── Sidebar ─── */}
      <div className={`${showSidebar ? "flex" : "hidden"} w-full md:flex md:w-80 lg:w-96 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700`}>
        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowAccountsModal(true)}
              title="Switch account"
              className="flex min-w-0 items-center gap-2 text-left"
            >

              <span className="flex min-w-0 items-center gap-1">
                <span
                  className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100"
                  style={usernameStyle}
                >
                  {user.username}
                </span>
                {user.is_verified && (
                  <img src={verified} alt="Verified" title="Verified user" className="inline h-4 w-4 shrink-0 -mt-0.5" />
                )}
              </span>
              <FiChevronDown size={14} className="shrink-0 text-gray-400" />
            </button>
            <button
              onClick={() => setShowStartModal(true)}
              title="Start a new chat"
              className="shrink-0 p-2 bg-tide-600 text-white rounded-full hover:bg-tide-700 transition-colors shadow-sm"
            >
              <TbMessage2Plus size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => searchUsers(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-tide-500 outline-none"
              />
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Drifts</h3>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
            </div>

            <div className="  flex overflow-x-auto pb-2 pl-1 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {!currentUserHasDrift && (
                <div 
                  className="flex min-w-[120px] max-w-[116px] shrink-0 flex-col items-center cursor-pointer"
                  onClick={() => setShowCreateDrift(true)}
                >
                  <div className="relative mb-2 w-auto rounded-[24px] border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-2 text-center shadow-sm flex items-center justify-center">
                    <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                      Drop a thought
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username || 'You'}&background=6366F1&color=fff`}
                      alt={user?.username || 'You'}
                      className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-md dark:border-gray-700"
                    />
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                      Your Drift
                    </span>
                  </div>
                </div>
              )}
              
              {filteredDrifts.map((drift) => (
                <div key={drift.id} className=" flex min-w-[120px] max-w-[116px] shrink-0 flex-col items-center cursor-pointer" onClick={() => setSelectedDrift(drift)}>
                  <div className="relative mb-2 w-auto rounded-[24px] border border-gray-200 bg-white px-2.5 py-2 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">

                    <div className="absolute -right-1.5 top-2 h-3.5 w-2 rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
                    <p className="relative z-10 break-words text-[11px] leading-tight text-gray-900 dark:text-gray-100">
                      {drift.note}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={drift.user?.avatar_url || `https://ui-avatars.com/api/?name=${drift.user?.username || 'Anonymous'}&background=${drift.user?.id === user?.id ? '6366F1' : '0d9488'}&color=fff`}
                      alt={drift.user?.username || 'Anonymous'}
                      className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-md dark:border-gray-700"
                    />
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                      {drift.user?.id === user?.id ? "You" : (drift.user?.username || 'Anonymous')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-2 pt-3 pb-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${isActive
                  ? tab.key === "bottles"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                    : "bg-tide-100 dark:bg-tide-900/30 text-tide-700 dark:text-tide-300"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Conversation list */}
        <div className=" divide-y flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-tide-500" />
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              {activeTab === "bottles" ? (
                <><FiAnchor size={32} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium mb-1">No bottle messages yet</p>
                  <p className="text-xs text-gray-500 px-6 text-center">Drop an anonymous message into the sea and see who finds it</p>
                </>
              ) : activeTab === "groups" ? (
                <><FiUsers size={32} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium mb-1">No group chats yet</p>
                  <p className="text-xs text-gray-500 px-6 text-center">Start a group to chat with multiple friends at once</p>
                </>
              ) : (
                <><FiMessageCircle size={32} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium mb-1">No conversations yet</p>
                  <p className="text-xs text-gray-500 px-6 text-center">Search for someone above or visit their profile to send a message</p>
                </>
              )}
            </div>
          ) : (
            <div className="">
              {filteredConvos.map((conv) => {
                const Icon = CONVO_ICONS[conv.type] || FiMessageCircle;
                const isSelected = activeConvo?.uuid === conv.uuid;
                return (
                  <button key={conv.uuid} onClick={() => handleSelectConvo(conv)}
                    className={`w-full flex items-center gap-3 px-3 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors ${isSelected ? "bg-tide-50 dark:bg-tide-900/20 md:border-l-2 md:border-tide-500" : ""
                      }`}
                  >
                    <ConversationAvatar conv={conv} online={(conv.type === "direct" || conv.type === "bottle") && !!onlineUsers[String(conv.other_user?.id)] && showPresence} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">
                          {conv.type === "direct" ? conv.other_user?.username || "Unknown" : conv.name || "Message in a Bottle"}

                        </span>
                        {conv.type !== "direct" && <Icon size={12} className="text-gray-400 shrink-0" />}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="inline-block mt-1 text-xs bg-tide-600 text-white px-2 py-0.5 rounded-full font-medium">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Panel ─── */}
      <div className={`${showChat ? "flex" : "hidden"} flex-1 md:flex flex-col bg-white dark:bg-gray-900 min-w-0`}>

        {activeConvo ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 shrink-0 bg-white dark:bg-gray-900">
              <button onClick={handleBack} className="md:hidden p-1.5 text-gray-500 hover:text-tide-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiArrowLeft size={20} />
              </button>
              <ConversationAvatar conv={activeConvo} size="w-9 h-9 md:w-9 md:h-9" online={otherUserOnline} isFound={activeConvo?.type === "bottle" ? messages.some((m) => m.is_bottle && m.is_found) : undefined} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{activeConvoDisplayName}</p>
                {otherUserOnline ? (
                  <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Online
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 font-medium">Offline</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {isDirectChat && (
                  <button onClick={() => setShowCall(true)}
                    className="p-2 text-gray-500 hover:text-tide-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Voice call"
                  >
                    <FiPhone size={18} />
                  </button>
                )}
                <button onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-500 hover:text-tide-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Chat settings"
                >
                  <FiSettings size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-sm mb-1">No messages yet</p>
                  <p className="text-xs text-gray-500">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const showSep = !prevMsg || !isSameDay(msg.inserted_at, prevMsg.inserted_at);
                  return (
                    <React.Fragment key={msg.id}>
                      {showSep && (
                        <div className="flex justify-center my-4">
                          <div className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 shadow-sm">
                            <span className="text-[11px] uppercase tracking-widest text-gray-600 dark:text-gray-300 font-semibold">
                              {formatDateSeparator(msg.inserted_at)}
                            </span>
                          </div>
                        </div>
                      )}
                      <MessageBubble
                        msg={msg}
                        isMe={msg.user_id === user.id}
                        skin={msg.user_id === user.id ? myMessageSkin : otherUserMessageSkin}
                        onImageClick={setPreviewUrl}
                        onReply={handleReply}
                        onDelete={handleDeleteMessage}
                        onEdit={handleEditMessage}
                        onStar={handleStarMessage}
                        isStarred={starredMessages.has(msg.id)}
                        menuOpen={openMenuId === msg.id}
                        onToggleMenu={setOpenMenuId}
                      />
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply bar */}
            {replyingTo && (
              <div className="px-3 py-2 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <svg className="w-4 h-4 shrink-0 text-tide-500 dark:text-tide-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a5 5 0 015 5v2.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L15 12.586V12a3 3 0 00-3-3H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Replying to <span className="text-tide-600 dark:text-tide-400">{replyingTo.user?.username || "Someone"}</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyingTo.content || (replyingTo.media_files?.length > 0 ? "[Media]" : "")}</p>
                </div>
                <button onClick={handleClearReply} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                  <FiX size={16} />
                </button>
              </div>
            )}

            {/* Upload previews */}
            {uploadedFiles.length > 0 && (
              <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="relative shrink-0 group">
                    {f.type === "image" ? (
                      <img src={f.url} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                    ) : f.type === "audio" ? (
                      <div className="h-16 w-16 rounded-lg bg-tide-100 dark:bg-tide-900/30 flex items-center justify-center border">
                        <FiMic size={22} className="text-tide-600" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border">
                        <FiImage size={22} className="text-gray-400" />
                      </div>
                    )}
                    <button onClick={() => removeUploadedFile(i)}
                      className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-0.5 shadow-md hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Composer */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <form onSubmit={sendMessage} className="px-3 py-2 flex items-end gap-2">
                {/* Emoji */}
                <div className="relative" ref={emojiRef}>
                  <button type="button" onClick={() => setShowEmoji(!showEmoji)}
                    className="shrink-0 p-2 text-gray-400 hover:text-tide-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FiSmile size={20} />
                  </button>
                  {showEmoji && (
                    <div className="absolute bottom-full left-0 mb-2 z-50">
                      <div className="shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Picker data={data} onEmojiSelect={onEmojiSelect} theme={document.documentElement.classList.contains("dark") ? "dark" : "light"} previewPosition="none" skinTonePosition="none" set="native" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Media upload */}
                <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="shrink-0 p-2 text-gray-400 hover:text-tide-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <FiImage size={20} />
                </button>

                {/* Recording bar */}
                {recording ? (
                  <div className="flex items-center gap-2 flex-1 bg-red-50 dark:bg-red-900/20 rounded-2xl px-4 py-2 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">{fmtRecTime(recordingTime)}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-0.5 h-6">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="w-0.5 bg-tide-500 rounded-full transition-all duration-75"
                          style={{
                            height: `${Math.max(4, Math.sin(i * 0.5 + Date.now() * 0.003) * 12 + 14)}px`,
                            opacity: 0.4 + Math.sin(i * 0.3 + Date.now() * 0.005) * 0.3 + 0.5
                          }}
                        />
                      ))}
                    </div>
                    <button type="button" onClick={stopRecording}
                      className="shrink-0 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiStopCircle size={18} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={startRecording}
                    className="shrink-0 p-2 text-gray-400 hover:text-tide-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FiMic size={20} />
                  </button>
                )}

                {!recording && (
                  <>
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onInput={autoResize}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                      placeholder={replyingTo ? "Reply..." : "Type a message..."}
                      rows={1}
                      ref={textareaRef}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-tide-500 outline-none resize-none overflow-y-auto scrollbar-hide max-h-32"
                    />
                    <button type="submit"
                      disabled={!messageText.trim() && uploadedFiles.length === 0}
                      className="shrink-0 p-2.5 bg-tide-600 text-white rounded-full hover:bg-tide-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                      ) : (
                        <FiSend size={16} />
                      )}
                    </button>
                  </>
                )}
              </form>
            </div>
          </>
        ) : <div className="flex items-center justify-center h-full text-gray-400">
          <div className="flex flex-col items-center justify-center">
            <GiBigWave size={60} className="mb-2 opacity-50 dark:text-white" />
            <h1 className="text-base font-medium text-gray-500 text-center">
              Send messages to get the Vibe Flowing
            </h1>
            <button
              onClick={() => setShowStartModal(true)}
              className="flex items-center justify-center rounded-lg mt-4 py-2 px-4 bg-tide-600 text-white hover:bg-tide-700 transition-colors"
            >
              <span>Send Message</span>
            </button>
          </div>

        </div>
        }
      </div>

      {/* Voice Call Modal */}
      {showCall && activeConvo && (
        <VoiceCallModal onClose={() => setShowCall(false)} otherUser={activeConvo.other_user} />
      )}

      {/* Image Preview Lightbox */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
          <button onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
          >
            <FiX size={24} />
          </button>
          <img
            src={previewUrl}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Chat Settings Modal */}
      <ChatSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentSkin={myMessageSkin}
        onSelect={updateSkin}
      />

      {/* Drift Modal */}
      <DriftModal
        drift={selectedDrift}
        isOpen={!!selectedDrift}
        onClose={() => setSelectedDrift(null)}
        onReact={async (driftId, emoji) => {
          try {
            await driftApi.react(driftId, emoji);
            const updated = await driftApi.get(driftId);
            setDrifts(prev => prev.map(d => d.id === driftId ? updated : d));
            setSelectedDrift(updated);
          } catch (error) {
            console.error('Failed to react to drift:', error);
          }
        }}
        onReply={async (driftId, content) => {
          try {
            const updated = await driftApi.reply(driftId, content);
            setDrifts(prev => prev.map(d => d.id === driftId ? updated : d));
            setSelectedDrift(updated);
          } catch (error) {
            console.error('Failed to reply to drift:', error);
          }
        }}
        onDelete={async (driftId) => {
          try {
            await api.delete(`/drifts/${driftId}`);
            setDrifts(prev => prev.filter(d => d.id !== driftId));
          } catch (error) {
            console.error('Failed to delete drift:', error);
            throw error;
          }
        }}
        onEdit={async (driftId, newNote) => {
          try {
            await api.put(`/drifts/${driftId}`, { drift: { note: newNote } });
            const updated = await driftApi.get(driftId);
            setDrifts(prev => prev.map(d => d.id === driftId ? updated : d));
            setSelectedDrift(updated);
          } catch (error) {
            console.error('Failed to edit drift:', error);
            throw error;
          }
        }}
        currentUser={user}
      />

      {/* Create Drift Modal */}
      {showCreateDrift && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl rounded-3xl bg-white dark:bg-gray-800 shadow-2xl"
          >
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Drift</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Share your current vibe with the world</p>
                </div>
                <button
                  onClick={() => setShowCreateDrift(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <textarea
                value={newDriftText}
                onChange={(e) => setNewDriftText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-gray-200 outline-none transition focus:border-tide-500 focus:ring-2 focus:ring-tide-500"
                rows={3}
                autoFocus
              />
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowCreateDrift(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDrift}
                  disabled={!newDriftText.trim()}
                  className="flex-1 px-4 py-2 bg-tide-600 text-white rounded-xl hover:bg-tide-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <FiSend size={16} />
                  Share Drift
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* New chat modals */}
      {showAccountsModal && <AccountsModal user={user} onClose={() => setShowAccountsModal(false)} />}
      {showStartModal && (
        <StartChatModal onClose={() => setShowStartModal(false)} onSelect={handleNewChatSelect} />
      )}
      {showDirectModal && (
        <DirectChatModal onClose={() => setShowDirectModal(false)} onStart={handleStartDirectChat} />
      )}
      {showGroupModal && (
        <GroupChatModal onClose={() => setShowGroupModal(false)} onCreate={handleCreateGroup} />
      )}
      {showBottleModal && (
        <BottleModal onClose={() => setShowBottleModal(false)} onThrow={handleThrowBottle} />
      )}
    </div>
  );
}
