import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";
import {
  FiX, FiMusic, FiType, FiSmile, FiRefreshCw,
  FiSun, FiSend, FiLoader
} from "react-icons/fi";

export default function CreateWave() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const previewAudioRef = useRef(null);

  const [source, setSource] = useState("camera");
  const [cameraFacing, setCameraFacing] = useState("user");
  const [flashOn, setFlashOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const durationIntervalRef = useRef(null);
  const recordStartTimeRef = useRef(0);
  const recordTimerRef = useRef(null);
  const isRecordingRef = useRef(false);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [capturing, setCapturing] = useState(false);

  // Music state
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [searchingMusic, setSearchingMusic] = useState(false);
  const [previewingTrackId, setPreviewingTrackId] = useState(null);
  const [showMusicSearch, setShowMusicSearch] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCapturing(true);
    } catch {
      showToast({ type: "error", title: "Camera Error", message: "Could not access camera" });
    }
  }, [cameraFacing]);

  const startCameraRef = useRef(startCamera);
  startCameraRef.current = startCamera;

  useEffect(() => {
    startCameraRef.current();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCapturing(false);
  };

  const switchCamera = async () => {
    setCameraFacing((f) => (f === "user" ? "environment" : "user"));
    if (capturing) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  };

  const toggleFlash = () => {
    setFlashOn((f) => !f);
    const track = streamRef.current?.getVideoTracks()[0];
    if (track?.getCapabilities().torch) {
      track.applyConstraint({ advanced: [{ torch: !flashOn }] }).catch(() => {});
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewType("image");
      setShowConfirm(true);
      stopCamera();
    }, "image/jpeg");
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setRecordDuration(0);
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9" : "video/webm",
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewType("video");
      clearInterval(durationIntervalRef.current);
      setShowConfirm(true);
      stopCamera();
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
    durationIntervalRef.current = setInterval(() => {
      setRecordDuration((d) => {
        if (d >= 60) { stopRecording(); return d; }
        return d + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleShutterDown = (e) => {
    e.preventDefault();
    if (recording) return;
    recordStartTimeRef.current = Date.now();
    isRecordingRef.current = false;

    recordTimerRef.current = setTimeout(() => {
      isRecordingRef.current = true;
      startRecording();
    }, 450);
  };

  const handleShutterUp = (e) => {
    e.preventDefault();
    if (recordTimerRef.current) {
      clearTimeout(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (isRecordingRef.current || recording) {
      stopRecording();
      isRecordingRef.current = false;
    } else {
      capturePhoto();
    }
  };

  const handleShutterCancel = (e) => {
    if (recordTimerRef.current) {
      clearTimeout(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (isRecordingRef.current || recording) {
      stopRecording();
      isRecordingRef.current = false;
    }
  };

  const handleGallerySelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewType(file.type.startsWith("video/") ? "video" : "image");
    setShowConfirm(true);
    if (capturing) stopCamera();
  };

  const uploadToR2 = async (blob, contentType) => {
    const res = await api.post("/uploads/media", blob, {
      headers: { "Content-Type": contentType },
      params: { content_type: contentType, upload_id: `wave-${Date.now()}` },
    });
    return res.data.data?.url;
  };

  const handleShare = async () => {
    if (!previewUrl || publishing) return;
    setPublishing(true);
    navigate(-1);
    showToast({ type: "success", title: "Uploading...", message: "Your wave is being published.", duration: 3000 });
    try {
      const resp = await fetch(previewUrl);
      const blob = await resp.blob();
      const contentType = previewType === "video" ? "video/webm" : "image/jpeg";
      const finalMediaUrl = await uploadToR2(blob, contentType);

      let musicTrackId = null;
      if (selectedMusic) {
        const musicRes = await api.post("/music/tracks", {
          music_track: {
            title: selectedMusic.trackName, artist: selectedMusic.artistName,
            audio_url: selectedMusic.previewUrl, cover_art: selectedMusic.artworkUrl,
            itunes_track_id: String(selectedMusic.trackId), duration_ms: String(selectedMusic.durationMs || 0),
          },
        });
        musicTrackId = musicRes.data.data?.music_track?.id;
      }

      const waveRes = await api.post("/waves", {
        wave: { media_url: finalMediaUrl, media_type: previewType, caption, music_track_id: musicTrackId },
      });

      showToast({
        type: "success", title: "Wave published!",
        message: "Your wave is now live.",
        link: `/waves/view/${waveRes.data.data?.wave?.user?.username || "me"}`,
        linkText: "View wave", duration: 8000,
      });
    } catch {
      showToast({ type: "error", title: "Upload failed", message: "Something went wrong.", duration: 5000 });
    }
    setPublishing(false);
  };

  // Music search
  const searchMusic = async (q) => {
    setMusicQuery(q);
    if (!q.trim()) { setMusicResults([]); return; }
    setSearchingMusic(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=12&entity=song`);
      const data = await res.json();
      setMusicResults((data.results || []).map((r) => ({
        trackId: String(r.trackId), trackName: r.trackName, artistName: r.artistName,
        artworkUrl: r.artworkUrl100?.replace("100x100", "300x300"), previewUrl: r.previewUrl,
        collectionName: r.collectionName, durationMs: r.trackTimeMillis,
      })));
    } catch { setMusicResults([]); }
    setSearchingMusic(false);
  };

  const handleSelectMusic = (track) => {
    setSelectedMusic(track);
    setShowMusicSearch(false);
    if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current.src = ""; }
    setPreviewingTrackId(null);
    if (audioRef.current) { audioRef.current.src = track.previewUrl; audioRef.current.loop = true; audioRef.current.play().catch(() => {}); }
  };

  const handlePreviewMusic = (track) => {
    if (previewingTrackId === track.trackId) {
      previewAudioRef.current?.pause(); setPreviewingTrackId(null);
    } else {
      if (previewAudioRef.current) { previewAudioRef.current.src = track.previewUrl; previewAudioRef.current.volume = 0.5; previewAudioRef.current.play().catch(() => {}); }
      setPreviewingTrackId(track.trackId);
    }
  };

  const handleRemoveMusic = () => {
    setSelectedMusic(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
  };

  const retake = () => {
    setPreviewUrl(null);
    setPreviewType(null);
    setShowConfirm(false);
    setCaption("");
    setPublishing(false);
    setTimeout(startCamera, 100);
  };

  // ---- Camera view ----
  const renderCamera = () => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white p-2">
          <FiX size={22} />
        </button>
        <div className="text-white text-sm font-mono font-semibold bg-black/40 px-3 py-1 rounded-full">
          {String(Math.floor(recordDuration / 60)).padStart(2, "0")}:{String(recordDuration % 60).padStart(2, "0")}
        </div>
        <div className="flex gap-3">
          <button onClick={toggleFlash} className={`p-2 rounded-full ${flashOn ? 'text-sun-400' : 'text-white/70 hover:text-white'}`}>
            <FiSun size={18} />
          </button>
        </div>
      </div>

      {/* Camera preview */}
      <video ref={videoRef} autoPlay playsInline muted className="flex-1 w-full object-cover" />

      {/* Right-edge tool stack */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-10">
        <button onClick={switchCamera}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
          <FiRefreshCw size={16} />
        </button>
        <button onClick={() => {}}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
          <FiType size={16} />
        </button>
        <button onClick={() => { setShowMusicSearch(true); searchMusic("trending"); }}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
          <FiMusic size={16} />
        </button>
        <button onClick={() => {}}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
          <FiSmile size={16} />
        </button>
      </div>

      {/* Pill toggle + Capture button */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-10">
        <div className="flex bg-white/15 backdrop-blur-sm rounded-full p-0.5">
          <button onClick={() => setSource("camera")}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${source === "camera" ? 'bg-white text-gray-900' : 'text-white/60'}`}>
            Camera
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${source !== "camera" ? 'bg-white text-gray-900' : 'text-white/60'}`}>
            Gallery
          </button>
        </div>

        <button
          onMouseDown={handleShutterDown}
          onMouseUp={handleShutterUp}
          onMouseLeave={handleShutterCancel}
          onTouchStart={handleShutterDown}
          onTouchEnd={handleShutterUp}
          onTouchCancel={handleShutterCancel}
          className={`w-16 h-16 rounded-full border-4 transition-all ${recording ? 'border-red-500 scale-110' : 'border-white'} flex items-center justify-center`}>
          <div className={`rounded-full transition-all ${recording ? 'w-5 h-5 bg-red-500 rounded' : 'w-12 h-12 bg-white rounded-full'}`} />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleGallerySelect} />
      <audio ref={audioRef} />

      {/* Music search */}
      {showMusicSearch && renderMusicSearch()}
      <audio ref={previewAudioRef} onEnded={() => setPreviewingTrackId(null)} />
    </div>
  );

  // ---- Confirm overlay ----
  const renderConfirm = () => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Preview */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {previewType === "video" ? (
          <video src={previewUrl} autoPlay muted loop playsInline className="max-h-full max-w-full object-contain" />
        ) : (
          <img src={previewUrl} alt="" className="max-h-full max-w-full object-contain" />
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={retake} className="text-white/70 hover:text-white p-2">
            <FiX size={22} />
          </button>
          <div className="flex items-center gap-2">
            {selectedMusic && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                <FiMusic size={11} className="text-flow-400" />
                <span className="text-[11px] text-white/80 truncate max-w-[80px]">{selectedMusic.trackName}</span>
                <button onClick={handleRemoveMusic} className="text-white/40 hover:text-white ml-0.5"><FiX size={10} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-900 px-4 py-4 space-y-3">
        <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..." autoFocus
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none placeholder-white/40" />
        <div className="flex items-center gap-2">
          {selectedMusic ? (
            <button onClick={handleRemoveMusic}
              className="text-xs text-flow-400 hover:text-flow-300 font-medium">Change sound</button>
          ) : (
            <button onClick={() => { setShowMusicSearch(true); searchMusic("trending"); }}
              className="text-xs text-flow-400 hover:text-flow-300 font-medium">Add sound</button>
          )}
        </div>
        <button onClick={handleShare} disabled={publishing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-flow-500 to-coral-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {publishing ? <FiLoader size={16} className="animate-spin" /> : <FiSend size={16} />}
          {publishing ? "Publishing..." : "Share Wave"}
        </button>
      </div>

      {/* Music search (if triggered from confirm) */}
      {showMusicSearch && renderMusicSearch()}
      <audio ref={previewAudioRef} onEnded={() => setPreviewingTrackId(null)} />
    </div>
  );

  // ---- Music search (shared) ----
  const renderMusicSearch = () => (
    <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col"
      onClick={() => setShowMusicSearch(false)}>
      <div className="mt-auto bg-gray-900 rounded-t-2xl max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold">Add Sound</h3>
          <button onClick={() => setShowMusicSearch(false)} className="text-white/50 hover:text-white p-1"><FiX size={18} /></button>
        </div>
        <div className="p-4">
          <div className="relative">
            <FiMusic size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input type="text" value={musicQuery} onChange={(e) => searchMusic(e.target.value)}
              placeholder="Search songs..." autoFocus
              className="w-full bg-white/10 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-flow-500/50 placeholder-white/40" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {searchingMusic ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
          ) : musicResults.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">{musicQuery ? "No songs found" : "Type to search"}</p>
          ) : musicResults.map((track) => (
            <div key={track.trackId}
              className={`flex items-center gap-3 p-2 rounded-xl transition ${selectedMusic?.trackId === track.trackId ? 'bg-flow-500/20 ring-1 ring-flow-500/40' : 'hover:bg-white/5'}`}>
              <button onClick={() => handlePreviewMusic(track)}
                className="shrink-0 w-12 h-12 rounded-lg overflow-hidden relative group">
                <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 flex items-center justify-center ${previewingTrackId === track.trackId ? 'bg-black/40' : 'bg-black/20 group-hover:bg-black/30'}`}>
                  {previewingTrackId === track.trackId ? (
                    <div className="flex items-end gap-0.5 h-4">
                      {[1,2,3].map((i) => (
                        <div key={i} className="w-0.5 bg-white rounded-full animate-pulse" style={{height: `${50 + i * 20}%`, animationDelay: `${i * 0.1}s`}} />
                      ))}
                    </div>
                  ) : (
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </div>
              </button>
              <button onClick={() => handleSelectMusic(track)} className="flex-1 min-w-0 text-left py-1">
                <p className="text-sm font-medium text-white truncate">{track.trackName}</p>
                <p className="text-xs text-white/50 truncate">{track.artistName}</p>
              </button>
              <button onClick={() => handleSelectMusic(track)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedMusic?.trackId === track.trackId ? 'bg-flow-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {selectedMusic?.trackId === track.trackId ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (showConfirm) return renderConfirm();
  return renderCamera();
}
