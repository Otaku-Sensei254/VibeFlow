import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";
import {
  FiX, FiCamera, FiMusic, FiType, FiSmile, FiSun, FiRefreshCw,
  FiChevronRight, FiSend, FiImage, FiMic, FiScissors, FiSave
} from "react-icons/fi";

const CATEGORIES = [
  "Tech", "Drama", "Action", "Fiction", "Music", "Fitness", "Sports",
  "Thrills", "Science", "Fashion", "Beauty", "Gossip", "Food", "Politics",
  "Business", "Comedy", "Nature", "Couples", "Kids"
];

export default function CreateCurrent() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const previewAudioRef = useRef(null);
  const audioRef = useRef(null);

  const [step, setStep] = useState("capture");
  const [source, setSource] = useState("camera");
  const [cameraFacing, setCameraFacing] = useState("user");
  const [flashOn, setFlashOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const durationIntervalRef = useRef(null);
  const recordStartTimeRef = useRef(0);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  // Step 3 state
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Music state
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [searchingMusic, setSearchingMusic] = useState(false);
  const [previewingTrackId, setPreviewingTrackId] = useState(null);
  const [showMusicSearch, setShowMusicSearch] = useState(false);

  const [trimStart, setTrimStart] = useState(0);
  // eslint-disable-next-line no-unused-vars -- setTrimEnd reserved for trim-handle drag (not yet wired)
  const [trimEnd, setTrimEnd] = useState(1);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const constraints = {
        video: { facingMode: cameraFacing, torch: flashOn },
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      showToast({ type: "error", title: "Camera Error", message: "Could not access camera" });
    }
  }, [cameraFacing, flashOn]);

  const startCameraRef = useRef(startCamera);
  startCameraRef.current = startCamera;

  useEffect(() => {
    startCameraRef.current();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const switchCamera = async () => {
    setCameraFacing((f) => (f === "user" ? "environment" : "user"));
    if (streamRef.current) {
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

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setRecordDuration(0);
    recordStartTimeRef.current = Date.now();

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
      stopCamera();
      setStep("edit");
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);

    durationIntervalRef.current = setInterval(() => {
      setRecordDuration((d) => {
        if (d >= 60) {
          stopRecording();
          return d;
        }
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
      stopCamera();
      setStep("edit");
    }, "image/jpeg");
  };

  const recordTimerRef = useRef(null);
  const isRecordingRef = useRef(false);

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
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      showToast({ type: "error", title: "Invalid file", message: "Please select an image or video file" });
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewType(isVideo ? "video" : "image");
    stopCamera();
    setStep("edit");
  };

  const uploadMedia = async (blob, contentType) => {
    const res = await api.post("/uploads/media", blob, {
      headers: { "Content-Type": contentType },
      params: { content_type: contentType, upload_id: `current-${Date.now()}` },
    });
    return res.data.data?.url;
  };

  const handlePublish = async () => {
    if (!previewUrl || publishing) return;
    setPublishing(true);
    showToast({ type: "info", title: "Publishing...", message: "Your current is being uploaded.", duration: 10000 });
    try {
      const resp = await fetch(previewUrl);
      const blob = await resp.blob();
      const contentType = previewType === "video" ? "video/webm" : "image/jpeg";
      const mediaUrl = await uploadMedia(blob, contentType);

      let musicTrackId = null;
      if (selectedMusic) {
        const musicRes = await api.post("/music/tracks", {
          music_track: {
            title: selectedMusic.trackName,
            artist: selectedMusic.artistName,
            audio_url: selectedMusic.previewUrl,
            cover_art: selectedMusic.artworkUrl,
            itunes_track_id: String(selectedMusic.trackId),
            duration_ms: String(selectedMusic.durationMs || 0),
          },
        });
        musicTrackId = musicRes.data.data?.music_track?.id;
      }

      const mediaFiles = [{ url: mediaUrl, type: previewType }];
      if (musicTrackId) {
        mediaFiles.push({ url: selectedMusic.previewUrl, type: "audio", music_track_id: musicTrackId });
      }

      await api.post("/currents", {
        current: {
          title: caption?.trim().slice(0, 100) || "Current",
          content: caption?.trim() || "Shared a Current",
          media_files: mediaFiles,
          tags: tags,
          category: category || "Music",
          status: "published",
        },
      });

      showToast({ type: "success", title: "Posted!", message: "Your current is now live.", duration: 5000 });
      navigate(-1);
    } catch {
      showToast({ type: "error", title: "Upload failed", message: "Something went wrong.", duration: 5000 });
      setPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!previewUrl) return;
    try {
      const resp = await fetch(previewUrl);
      const blob = await resp.blob();
      const contentType = previewType === "video" ? "video/webm" : "image/jpeg";
      const mediaUrl = await uploadMedia(blob, contentType);
      await api.post("/currents", {
        current: {
          title: caption?.trim().slice(0, 100) || "Current",
          content: caption?.trim() || "Shared a Current",
          media_files: [{ url: mediaUrl, type: previewType }],
          tags: tags,
          category: category || "Music",
          status: "processing",
        },
      });
      showToast({ type: "success", title: "Draft saved", message: "Your current has been saved as a draft.", duration: 3000 });
      navigate(-1);
    } catch {}
  };

  // Music search (reused from CreateWave)
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
      previewAudioRef.current?.pause();
      setPreviewingTrackId(null);
    } else {
      if (previewAudioRef.current) { previewAudioRef.current.src = track.previewUrl; previewAudioRef.current.volume = 0.5; previewAudioRef.current.play().catch(() => {}); }
      setPreviewingTrackId(track.trackId);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  // ---- Step 1: Capture ----
  const renderCaptureStep = () => (
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
          <button onClick={switchCamera} className="text-white/70 hover:text-white p-2">
            <FiRefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Camera view */}
      <video ref={videoRef} autoPlay playsInline muted className="flex-1 w-full object-cover" />

      {/* Right-edge tool stack */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-10">
        {[
          { icon: FiRefreshCw, label: "Flip", action: switchCamera },
          { icon: FiSun, label: "Flash", action: toggleFlash },
          { icon: FiScissors, label: "Adjust", action: () => {} },
          { icon: FiImage, label: "Gallery", action: () => fileInputRef.current?.click() },
        ].map((tool) => (
          <button key={tool.label} onClick={tool.action}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
            <tool.icon size={16} />
          </button>
        ))}
      </div>

      {/* Pill toggle + Capture button */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-10">
        <div className="flex bg-white/15 backdrop-blur-sm rounded-full p-0.5">
          <button onClick={() => { setSource("camera"); setTimeout(startCamera, 100); }}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${source === "camera" ? 'bg-white text-gray-900' : 'text-white/60'}`}>
            Camera
          </button>
          <button onClick={() => { stopCamera(); fileInputRef.current?.click(); }}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${source !== "camera" ? 'bg-white text-gray-900' : 'text-white/60'}`}>
            Upload
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
    </div>
  );

  // ---- Step 2: Edit ----
  const renderEditStep = () => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {previewType === "video" ? (
          <video ref={videoRef} key={previewUrl} src={previewUrl} controls autoPlay muted playsInline className="max-h-full max-w-full object-contain" />
        ) : (
          <img src={previewUrl} alt="" className="max-h-full max-w-full object-contain" />
        )}
      </div>

      {/* Tool rail */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-10">
        {[
          { icon: FiMusic, label: "Sound", action: () => { setShowMusicSearch(true); searchMusic("trending"); } },
          { icon: FiType, label: "Text", action: () => {} },
          { icon: FiMic, label: "Voice", action: () => {} },
          { icon: FiSmile, label: "Sticker", action: () => {} },
        ].map((tool) => (
          <button key={tool.label} onClick={tool.action}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
            <tool.icon size={16} />
          </button>
        ))}
      </div>

      {/* Trim bar */}
      <div className="px-4 py-3 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative cursor-pointer"
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setTrimStart(Math.min(pct, trimEnd - 0.05));
            }}>
            <div className="absolute h-full bg-tide-500 rounded-full" style={{ left: `${trimStart * 100}%`, width: `${(trimEnd - trimStart) * 100}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" style={{ left: `${trimStart * 100}%`, marginLeft: -6 }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" style={{ left: `${trimEnd * 100}%`, marginLeft: -6 }} />
          </div>
          <button onClick={() => setStep("publish")}
            className="px-5 py-2 bg-gradient-to-r from-tide-600 to-flow-600 text-white text-sm font-semibold rounded-xl whitespace-nowrap">
            Continue <FiChevronRight size={14} className="inline ml-1" />
          </button>
        </div>
        {selectedMusic && (
          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-white/5 rounded-lg">
            <FiMusic size={12} className="text-flow-400 shrink-0" />
            <span className="text-xs text-white/80 truncate">{selectedMusic.trackName}</span>
            <span className="text-[10px] text-white/40">•</span>
            <span className="text-[10px] text-white/40 truncate">{selectedMusic.artistName}</span>
            <button onClick={() => setSelectedMusic(null)} className="ml-auto text-white/40 hover:text-white p-0.5"><FiX size={12} /></button>
          </div>
        )}
      </div>

      {/* Music search bottom sheet */}
      {showMusicSearch && renderMusicSearch()}
      <audio ref={previewAudioRef} onEnded={() => setPreviewingTrackId(null)} />
      <audio ref={audioRef} />
    </div>
  );

  // ---- Step 3: Publish ----
  const renderPublishStep = () => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        {previewType === "video" ? (
          <video src={previewUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110" />
        ) : (
          <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-4">
              {/* Cover thumbnail */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {previewType === "video" ? (
                    <video src={previewUrl} className="w-16 h-24 rounded-xl object-cover" />
                  ) : (
                    <img src={previewUrl} alt="" className="w-16 h-24 rounded-xl object-cover" />
                  )}
                  <button className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition">
                    <FiCamera size={14} className="text-white" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption..."
                    className="w-full bg-transparent text-white text-sm placeholder-white/40 resize-none outline-none" rows={2} />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    #{t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-white"><FiX size={10} /></button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (addTag())}
                    placeholder={tags.length === 0 ? "# Add hashtag" : ""}
                    className="w-20 bg-transparent text-xs text-white/60 placeholder-white/30 outline-none" />
                  {tagInput && <button onClick={addTag} className="text-tide-400 text-xs font-semibold">Add</button>}
                </div>
              </div>

              {/* Category */}
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none">
                <option value="" className="text-gray-900">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="text-gray-900">{c}</option>)}
              </select>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveDraft} disabled={publishing}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/80 text-sm font-semibold hover:bg-white/5 transition disabled:opacity-50">
                  <FiSave size={14} className="inline mr-1.5" />Save draft
                </button>
                <button onClick={handlePublish} disabled={publishing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-tide-600 to-flow-600 text-white text-sm font-semibold shadow-lg disabled:opacity-50">
                  {publishing ? "Posting..." : <><FiSend size={14} className="inline mr-1.5" />Share</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- Music Search (shared) ----
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
              className="w-full bg-white/10 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tide-500/50 placeholder-white/40" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {searchingMusic ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
          ) : musicResults.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">{musicQuery ? "No songs found" : "Type to search"}</p>
          ) : musicResults.map((track) => (
            <div key={track.trackId}
              className={`flex items-center gap-3 p-2 rounded-xl transition ${selectedMusic?.trackId === track.trackId ? 'bg-tide-500/20 ring-1 ring-tide-500/40' : 'hover:bg-white/5'}`}>
              <button onClick={() => handlePreviewMusic(track)} className="shrink-0 w-12 h-12 rounded-lg overflow-hidden relative group">
                <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 flex items-center justify-center ${previewingTrackId === track.trackId ? 'bg-black/40' : 'bg-black/20 group-hover:bg-black/30'}`}>
                  {previewingTrackId === track.trackId ? (
                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
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
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedMusic?.trackId === track.trackId ? 'bg-tide-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {selectedMusic?.trackId === track.trackId ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (step === "capture") return renderCaptureStep();
  if (step === "edit") return renderEditStep();
  if (step === "publish") return renderPublishStep();
  return null;
}
