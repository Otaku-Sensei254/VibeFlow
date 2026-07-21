import VideoPlayer from "./VideoPlayer";

const CustomVideoPlayer = ({
  src,
  poster,
  isImage = false,
  muted = true,
  autoPlay = true,
  loop = true,
  playsInline = true,
  useAutoplay = true,
  onMuteChange,
  className = "",
}) => {
  if (isImage) {
    return (
      <img
        src={src || poster}
        alt=""
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <VideoPlayer
      src={src}
      poster={poster}
      initialMuted={muted}
      autoPlay={autoPlay}
      loop={loop}
      playsInline={playsInline}
      className={className}
    />
  );
};

export default CustomVideoPlayer;