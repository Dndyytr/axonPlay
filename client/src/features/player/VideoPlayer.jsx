import { useRef, useState, useEffect } from "react";
import { MediaPlayer, MediaProvider, Track } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const VideoPlayer = ({
  videoUrl,
  episode,
  onNext,
  onPrev,
  hasPrev = false,
  hasNext = false,
  onProgressUpdate,
  initialProgress = 0,
}) => {
  const navigate = useNavigate();
  const player = useRef(null);
  const resumeShownRef = useRef(false);

  // State untuk resume prompt
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [hasLoadedMetadata, setHasLoadedMetadata] = useState(false);
  const promptShownRef = useRef(false);

  useEffect(() => {
    // ✅ Hanya tampilkan sekali, dan reset saat video URL berubah
    if (videoUrl) {
      promptShownRef.current = false;
    }
  }, [videoUrl]);

  // Check if we should show resume prompt when video loads
  useEffect(() => {
    if (
      initialProgress > 10 &&
      hasLoadedMetadata &&
      videoDuration > 0 &&
      !promptShownRef.current // ✅ cek ref, bukan resumeShownRef
    ) {
      if (initialProgress < videoDuration * 0.9) {
        promptShownRef.current = true; // ✅ set sebelum setState
        setShowResumePrompt(true);
      }
    }
  }, [initialProgress, hasLoadedMetadata, videoDuration]);

  useEffect(() => {
    // Reset semua state saat video URL berubah
    setShowResumePrompt(false);
    setHasLoadedMetadata(false);
    setVideoDuration(0);
    promptShownRef.current = false; // ✅ reset ref
  }, [videoUrl]);

  // Handle time update for progress saving
  const handleTimeUpdate = (event) => {
    const currentTime = event.currentTime ?? player.current?.currentTime;
    const duration = player.current?.duration;
    if (duration > 0) {
      setVideoDuration(duration);
      if (onProgressUpdate) onProgressUpdate(currentTime, duration);
    }
  };

  // Handle video metadata loaded
  const handleLoadedMetadata = ({ duration }) => {
    setVideoDuration(duration);
    setHasLoadedMetadata(true);

    // If there's saved progress, don't auto-seek yet - wait for user choice
    if (initialProgress > 10 && duration > 0) {
      // Keep video paused until user decides
      player.current?.pause();
    }
  };

  // Handle resume from saved position
  const handleResume = () => {
    if (player.current && initialProgress > 0) {
      player.current.currentTime = initialProgress;
    }
    setShowResumePrompt(false);
    resumeShownRef.current = false;
    player.current?.play();
  };

  // Handle start over from beginning
  const handleStartOver = () => {
    if (player.current) {
      player.current.currentTime = 0;
    }
    setShowResumePrompt(false);
    resumeShownRef.current = false;
    player.current?.play();
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Resume Prompt Overlay */}
      {showResumePrompt && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-dark-gray p-8 rounded-lg max-w-md text-center border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Continue Watching?
            </h3>
            <p className="text-gray-400 mb-2">
              {episode?.title || `Episode ${episode?.episode ?? 1}`}
            </p>
            <p className="text-gray-400 mb-6">
              You were at {formatTime(initialProgress)} of{" "}
              {formatTime(videoDuration)}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleResume}
                className="bg-primary px-6 py-3 rounded text-white font-semibold hover:bg-red-700 transition"
              >
                Resume
              </button>
              <button
                onClick={handleStartOver}
                className="bg-gray-700 px-6 py-3 rounded text-white font-semibold hover:bg-gray-600 transition"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 bg-linear-to-b from-black/80 to-transparent pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white transition pointer-events-auto"
        >
          <ArrowLeftIcon className="w-6 h-6" />
          <span className="font-semibold">Back</span>
        </button>
        <h2 className="text-white text-lg md:text-xl font-bold mt-2">
          {episode?.title ||
            `Episode ${episode?.episode ?? episode?.mal_id ?? 1}`}
        </h2>
      </div>

      {/* Player */}
      <MediaPlayer
        ref={player}
        src={videoUrl}
        className="w-full h-full"
        load="eager"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (hasNext && onNext) onNext();
        }}
      >
        <MediaProvider />

        {/* ✅ Default layout dengan semua kontrol built-in */}
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          slots={{
            // Tambah tombol prev/next episode
            beforePlayButton: hasPrev ? (
              <button
                onClick={onPrev}
                className="text-white hover:text-primary px-2 text-sm font-semibold"
                title="Previous Episode"
              >
                ⏮ Prev
              </button>
            ) : null,
            afterPlayButton: hasNext ? (
              <button
                onClick={onNext}
                className="text-white hover:text-primary px-2 text-sm font-semibold"
                title="Next Episode"
              >
                Next ⏭
              </button>
            ) : null,
          }}
        />
      </MediaPlayer>
    </div>
  );
};

export default VideoPlayer;
