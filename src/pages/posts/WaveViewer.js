import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiX, FiChevronLeft, FiVolume2, FiVolumeX, FiHeart, FiSend, FiShare2, FiUsers, FiMoreHorizontal } from "react-icons/fi";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import CustomVideoPlayer from "../../components/CustomVideoPlayer";

const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v"];

function isVideo(wave) {
  if (!wave) return false;
  if (wave.media_type === "video") return true;
  if (!wave.media_url) return false;
  try {
    const ext = new URL(wave.media_url).pathname.split(".").pop()?.toLowerCase();
    return ext ? VIDEO_EXTS.includes(`.${ext}`) : false;
  } catch { return false; }
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z");
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString();
}

export default function WaveViewer() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const [waveGroups, setWaveGroups] = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [chainEnabled, setChainEnabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [contactsTab, setContactsTab] = useState("all");
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [shareSearch, setShareSearch] = useState("");
  const [shareResults, setShareResults] = useState([]);
  const [sharing, setSharing] = useState(false);

  const globalIndex = (() => {
    if (!chainEnabled) return index;
    let offset = 0;
    for (let i = 0; i < groupIndex && i < waveGroups.length; i++) {
      offset += waveGroups[i].waves.length;
    }
    return offset + index;
  })();

  useEffect(() => {
    let cancelled = false;
    api.get("/waves").then((res) => {
      if (cancelled) return;
      const groups = res.data.data?.groups || [];
      setWaveGroups(groups);
      const idx = groups.findIndex((g) => g.user?.username === username);
      if (idx >= 0) {
        setGroupIndex(idx);
        setChainEnabled(true);
      } else if (groups.length > 0) {
        setGroupIndex(0);
        setChainEnabled(true);
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
    return () => { cancelled = true; };
  }, [username]);

  useEffect(() => {
    setLoaded(false);
    setProgress(0);
  }, [groupIndex, index]);

  const currentGroup = waveGroups[groupIndex];
  const waves = currentGroup?.waves || [];
  const current = waves[index];

  useEffect(() => {
    if (current) {
      setLiked(!!current.is_liked);
      setLikesCount(current.likes_count || 0);
    }
  }, [current]);

  useEffect(() => {
    if (!current) return;
    api.post(`/waves/${current.uuid}/view`).catch(() => {});
  }, [current]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (current?.music_track?.audio_url) {
      audioRef.current.src = current.music_track.audio_url;
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    }
  }, [current]);

  useEffect(() => {
    setProgress(0);
    clearInterval(timerRef.current);
    if (!current || !loaded || paused) return;
    const isVid = isVideo(current);
    const duration = isVid ? 15000 : 5000;
    const step = 100 / (duration / 50);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timerRef.current);
          setTimeout(goNext, 0);
          return 0;
        }
        return p + step;
      });
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [index, current?.uuid, loaded, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    if (index < waves.length - 1) {
      setIndex((i) => i + 1);
    } else if (chainEnabled && groupIndex < waveGroups.length - 1) {
      setGroupIndex((g) => g + 1);
      setIndex(0);
    } else {
      navigate(-1);
    }
  }, [index, waves.length, groupIndex, waveGroups.length, chainEnabled, navigate]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
    } else if (chainEnabled && groupIndex > 0) {
      setGroupIndex((g) => g - 1);
      const prevWaves = waveGroups[groupIndex - 1]?.waves || [];
      setIndex(prevWaves.length - 1);
    }
  }, [index, groupIndex, waveGroups, chainEnabled]);

  const handlePointerDown = () => {
    setPaused(true);
    if (videoRef.current) videoRef.current.pause();
  };

  const handlePointerUp = () => {
    setPaused(false);
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };

  const handleLike = async () => {
    if (!current) return;
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      const res = await api.post(`/waves/${current.uuid}/like`);
      setLiked(res.data.data?.liked ?? !prevLiked);
      setLikesCount(res.data.data?.likes_count ?? prevCount);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleSendDM = async () => {
    if (!messageText.trim() || !current || sending) return;
    const targetUser = current.user?.username;
    if (!targetUser) return;
    setSending(true);
    try {
      const convRes = await api.post(`/chat/start/${targetUser}`);
      const convUuid = convRes.data.data?.conversation?.uuid;
      if (convUuid) {
        await api.post(`/chat/conversations/${convUuid}/messages`, {
          message: { content: messageText.trim(), shared_wave_id: current.id }
        });
        setMessageText("");
      }
    } catch {}
    setSending(false);
  };

  const handleShareSearch = async (q) => {
    setShareSearch(q);
    if (!q.trim()) { setShareResults([]); return; }
    try {
      const res = await api.get("/users/search", { params: { q } });
      setShareResults(res.data.data?.users || []);
    } catch { setShareResults([]); }
  };

  const handleShare = async (targetUsername) => {
    if (!current || sharing) return;
    setSharing(true);
    try {
      const convRes = await api.post(`/chat/start/${targetUsername}`);
      const convUuid = convRes.data.data?.conversation?.uuid;
      if (convUuid) {
        await api.post(`/chat/conversations/${convUuid}/messages`, {
          message: { content: "Shared a wave", shared_wave_id: current.id }
        });
      }
    } catch {}
    setSharing(false);
    setShowShareModal(false);
  };

  useEffect(() => {
    if (!showShareModal || contactsLoaded) return;
    const loadContacts = async () => {
      try {
        const [folRes, folngRes] = await Promise.allSettled([
          api.get(`/users/${currentUser?.username}/followers`),
          api.get(`/users/${currentUser?.username}/following`),
        ]);
        setFollowers(folRes.status === "fulfilled" ? folRes.value.data.data?.users || [] : []);
        setFollowing(folngRes.status === "fulfilled" ? folngRes.value.data.data?.users || [] : []);
      } catch {}
      setContactsLoaded(true);
    };
    loadContacts();
  }, [showShareModal, currentUser?.username, contactsLoaded]);

  if (!current) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        {!loaded ? (
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : waveGroups.length > 0 ? (
          <p className="text-white/60 text-lg">No waves from {username}</p>
        ) : (
          <p className="text-white/60 text-lg">No waves available</p>
        )}
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white/70 hover:text-white p-2">
          <FiX size={24} />
        </button>
      </div>
    );
  }

  const allWaves = chainEnabled ? waveGroups.flatMap((g) => g.waves) : waves;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col select-none"
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
    >
      <audio ref={audioRef} />

      {/* Segmented progress bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-3">
        <div className="flex gap-0.5">
          {allWaves.map((w, i) => (
            <div key={w.id || i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                style={{
                  width:
                    i < globalIndex ? "100%"
                    : i === globalIndex ? `${progress}%`
                    : "0%",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Top-left: avatar + @handle + timestamp */}
      <div className="absolute top-8 left-3 z-10 flex items-center gap-2.5">
        <img
          src={current.user?.avatar_url ||
            `https://ui-avatars.com/api/?name=${current.user?.username || "?"}&background=6366F1&color=fff`}
          alt=""
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate max-w-[140px]">
            @{current.user?.username}
          </p>
          <p className="text-[10px] text-white/50">{formatTime(current.inserted_at)}</p>
        </div>
      </div>

      {/* Top-right: overflow menu */}
      <div className="absolute top-8 right-3 z-10">
        <button onClick={() => setShowOverflow(!showOverflow)}
          className="text-white/70 hover:text-white p-1.5">
          <FiMoreHorizontal size={20} />
        </button>
        {showOverflow && (
          <div className="absolute right-0 top-10 bg-gray-900 rounded-xl shadow-xl border border-white/10 py-1 min-w-[160px]"
            onMouseLeave={() => setShowOverflow(false)}>
            <button onClick={() => { setShowShareModal(true); setShowOverflow(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
              <FiShare2 size={14} /> Share
            </button>
            {isVideo(current) && (
              <button onClick={() => { setMuted(!muted); setShowOverflow(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
                {muted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />} {muted ? "Unmute" : "Mute"}
              </button>
            )}
            <button onClick={() => { navigate(-1); setShowOverflow(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
              <FiX size={14} /> Close
            </button>
          </div>
        )}
      </div>

      {/* Media area */}
      <div className="flex-1 relative flex items-center justify-center">
        {isVideo(current) ? (
          <CustomVideoPlayer
            ref={videoRef}
            key={current.uuid}
            src={current.media_url}
            useAutoplay={false}
            muted={muted}
            onMuteChange={setMuted}
            onLoadedData={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img
            key={current.uuid}
            src={current.media_url}
            alt=""
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className="max-h-full max-w-full object-contain"
          />
        )}

        <button onClick={goPrev}
          className="absolute left-0 top-0 bottom-0 w-[30%] flex items-center justify-start pl-2">
          {(chainEnabled && groupIndex > 0) || index > 0 ? (
            <FiChevronLeft size={32} className="text-white/50 drop-shadow-lg" />
          ) : null}
        </button>
        <button onClick={goNext} className="absolute right-0 top-0 bottom-0 w-[70%]" />
      </div>

      {/* Music info */}
      {current.music_track && (
        <div className="absolute bottom-20 left-4 right-4 z-10 flex items-center gap-2">
          <div className="flex items-end gap-0.5 h-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="w-0.5 bg-white rounded-full animate-pulse"
                style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s`, animationDuration: "0.8s" }} />
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{current.music_track.title}</p>
            <p className="text-[10px] text-white/50 truncate">{current.music_track.artist}</p>
          </div>
        </div>
      )}

      {/* Caption */}
      {current.caption && (
        <div className="absolute bottom-16 left-4 right-16 z-10">
          <p className="text-sm text-white/90">{current.caption}</p>
        </div>
      )}

      {/* Bottom bar: reply input + like + send */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Send a reply"
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40 min-w-0"
              onKeyDown={(e) => e.key === "Enter" && handleSendDM()}
            />
            <button onClick={handleLike} className="text-white/70 hover:text-coral-400 p-1 transition-all">
              <FiHeart size={18} className={liked ? 'fill-coral-500 text-coral-500' : ''} />
            </button>
          </div>
          <button
            onClick={handleSendDM}
            disabled={!messageText.trim() || sending}
            className="text-white/70 hover:text-white p-2 disabled:opacity-30"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center"
          onClick={() => { setShowShareModal(false); setContactsLoaded(false); }}>
          <div className="bg-gray-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-3">Share wave</h3>
            <input type="text" value={shareSearch} onChange={(e) => handleShareSearch(e.target.value)}
              placeholder="Search all users..." autoFocus
              className="w-full bg-white/10 text-white text-sm rounded-lg px-4 py-2 outline-none placeholder-white/40 mb-3" />
            {shareSearch.trim() === "" ? (
              <>
                <div className="flex gap-2 mb-3">
                  {["all", "followers", "following"].map((t) => (
                    <button key={t} onClick={() => setContactsTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${contactsTab === t ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'}`}>
                      {t === "all" ? <><FiUsers size={14} className="inline mr-1" /> Contacts</> : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {!contactsLoaded ? (
                    <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
                  ) : (
                    (contactsTab === "all"
                      ? [...new Map([...followers, ...following].map((u) => [u.id, u])).values()]
                      : contactsTab === "followers" ? followers : following
                    ).map((u) => (
                      <button key={u.id} onClick={() => handleShare(u.username)} disabled={sharing}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50">
                        <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}&background=6366F1&color=fff`} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <span className="text-white text-sm font-medium">{u.username}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1">
                {shareResults.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">No users found</p>
                ) : shareResults.map((u) => (
                  <button key={u.id} onClick={() => handleShare(u.username)} disabled={sharing}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50">
                    <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}&background=6366F1&color=fff`} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <span className="text-white text-sm font-medium">{u.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
