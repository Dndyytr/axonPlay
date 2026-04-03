import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useDispatch } from "react-redux";
import { removeFromHistory, clearHistoryAsync } from "../../store/userSlice";

const ContinueWatchingRow = ({ history, onFetchHistory }) => {
  const dispatch = useDispatch();
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleRemove = async (e, mal_id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(removeFromHistory(mal_id)).unwrap();
      if (onFetchHistory) {
        onFetchHistory();
      }
    } catch (error) {
      console.error("Failed to remove from history:", error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Hapus semua riwayat tontonan?")) return;
    try {
      await dispatch(clearHistoryAsync()).unwrap(); // ← ini async thunk ke backend
      // atau kalau mau clear local only:
      // dispatch(clearHistoryLocal());
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateProgress = (progress, duration) => {
    if (!duration || duration === 0) return 0;
    return Math.min((progress / duration) * 100, 100);
  };

  if (!history || history.length === 0) return null;

  return (
    <section className="py-6 relative group/row">
      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-12">
        ▶️ Continue Watching
      </h2>

      <button
        onClick={handleClearAll}
        className="text-sm text-gray-400 hover:text-red-400 transition"
      >
        Clear All
      </button>

      {/* Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-0 z-40 w-12 bg-linear-to-r from-dark to-transparent flex items-center justify-center transition-opacity duration-300 ${
            showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeftIcon className="w-8 h-8 text-white hover:scale-125 transition" />
        </button>

        {/* Cards Container */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {history.map((item) => {
            const progressPercent = calculateProgress(
              item.progress,
              item.duration,
            );
            const timeLeft = item.duration ? item.duration - item.progress : 0;

            return (
              <Link
                key={item.mal_id}
                to={`/watch/${item.mal_id}?episode=${item.episodeNumber}`}
                className="group relative shrink-0 w-56 md:w-64 bg-dark-gray rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video">
                  <img
                    src={item.image || "https://via.placeholder.com/320x180"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemove(e, item.mal_id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                    title="Remove from history"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>

                  {/* Episode Badge */}
                  <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                    Ep {item.episodeNumber}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition">
                    {item.title}
                  </h3>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{formatTime(item.progress)}</span>
                      <span>{formatTime(item.duration)}</span>
                    </div>
                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    {timeLeft > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.ceil(timeLeft / 60)} min left
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 z-40 w-12 bg-linear-to-l from-dark to-transparent flex items-center justify-center transition-opacity duration-300 ${
            showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRightIcon className="w-8 h-8 text-white hover:scale-125 transition" />
        </button>
      </div>
    </section>
  );
};

export default ContinueWatchingRow;
