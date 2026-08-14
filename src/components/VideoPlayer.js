import { useRef, useEffect, useState } from "react";
import { FiPlay, FiVolume2, FiVolumeX, FiLoader } from "react-icons/fi";
import useVideoAutoplay from "../hooks/useVideoAutoplay";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({
  src,
  poster,
  initialMuted = true,
  autoPlay = false,
  loop = false,
  playsInline = true,
  className = "",
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

// Custom hook for visibility-based autoplay
  const isVisible = useVideoAutoplay(videoRef, { threshold: 0.6 });

  // Event listeners for video state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Keep video.muted in sync with state (handles any external mutations)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlayPause = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    if (!videoRef.current || duration === 0) return;

    const rect = videoRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    videoRef.current.currentTime = percentage * duration;
  };

  if (!src) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-black/10 dark:bg-black/30 ${className}`}>
        <span className="text-xs text-gray-400">No video source</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full group cursor-pointer ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={isMuted}
        loop={loop}
        playsInline={playsInline}
        className="w-full h-full object-contain"
        onClick={togglePlayPause}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <FiLoader className="animate-spin text-white" size={24} />
        </div>
      )}

      {/* Play icon overlay (only when paused) */}
      {!isPlaying && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          <FiPlay className="text-white" size={48} />
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all pointer-events-auto"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div
          className="absolute bottom-2 left-0 right-0 h-1 bg-gray-700/50 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-gradient-to-r from-flow-500 to-coral-500"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div className="absolute -top-1 left-0 text-white text-xs px-1 bg-black/60 rounded pointer-events-none">
            {formatTime(currentTime)}
          </div>
        </div>
      )}
    </div>
  );
}