import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { animeAPI, userAPI } from "../services/api";
import VideoPlayer from "../features/player/VideoPlayer";
import { addToHistoryLocal } from "../store/userSlice"; // Update the path to match your project structure

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const watchHistory = useSelector((state) => state.user?.watchHistory || []);
  const lastSaveRef = useRef(0);

  // State (Renamed to avoid conflicts)
  const [animeData, setAnimeData] = useState(null);
  const [episodeList, setEpisodeList] = useState([]); // Renamed from 'episodes'
  const [currentEpNum, setCurrentEpNum] = useState(1);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEpisodeList, setShowEpisodeList] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);

  // Dummy video URLs
  const DUMMY_VIDEOS = [
    "https://www.youtube.com/watch?v=LXb3EKWsInQ", // Big Buck Bunny
    "https://www.youtube.com/watch?v=aqz-KE-bpKQ", // Elephant Dream
    "https://www.youtube.com/watch?v=YE7VzlLtp-4",
    "https://www.youtube.com/watch?v=BTN35BtrNgc",
  ];

  useEffect(() => {
    // 1. Auth Check
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/watch/${id}` } });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 2. Fetch Anime Detail
        const animeRes = await animeAPI.getById(id);
        const animeInfo = animeRes.data.data.anime;
        setAnimeData(animeInfo);

        // 3. Fetch Episodes
        let epsData = [];
        try {
          const epRes = await animeAPI.getEpisodes(id, { page: 1 });
          const rawEps = epRes.data.data.episodes || [];

          // ✅ Normalisasi field episode
          epsData = rawEps.map((ep, index) => ({
            ...ep,
            episode: ep.episode ?? ep.mal_id ?? index + 1,
            title:
              ep.title || `Episode ${ep.episode ?? ep.mal_id ?? index + 1}`,
          }));
        } catch (epErr) {
          console.warn("Failed to fetch episodes" + epErr.message);
          const totalEps = animeInfo.episodes || 12;
          epsData = Array.from({ length: Math.min(totalEps, 24) }, (_, i) => ({
            mal_id: i + 1,
            episode: i + 1,
            title: `Episode ${i + 1}`,
            aired: new Date().toISOString(),
          }));
        }
        setEpisodeList(epsData);

        // 4. Parse Episode Number SAFELY
        const paramEp = searchParams.get("episode");
        let targetEp = 1; // Default to 1

        if (paramEp && paramEp !== "undefined" && paramEp !== "null") {
          const parsed = parseInt(paramEp, 10);
          if (!isNaN(parsed) && parsed >= 1) {
            targetEp = parsed;
          }
        }

        // Ensure targetEp is within bounds
        if (epsData.length > 0 && targetEp > epsData.length) {
          targetEp = epsData.length;
        }

        setCurrentEpNum(targetEp);
        setVideoUrl(getVideoUrl(targetEp));
      } catch (err) {
        console.error("Watch Page Error:", err);
        setError(err.response?.data?.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated, navigate]); // Remove searchParams from dependency to avoid loop if not needed, or handle carefully

  // Helper: Get Video URL
  const getVideoUrl = (epNum) => {
    if (!epNum || epNum < 1) return DUMMY_VIDEOS[0];
    const index = (epNum - 1) % DUMMY_VIDEOS.length;
    return DUMMY_VIDEOS[index];
  };

  // Handler: Save Progress
  const handleProgressUpdate = async (progressSeconds, duration) => {
    if (!animeData) return;
    // Update local duration
    if (duration && duration !== videoDuration) {
      setVideoDuration(duration);
    }
    // ✅ Simpan ke backend hanya setiap 10 detik
    const now = Date.now();
    if (now - lastSaveRef.current < 10000) {
      // Update local state saja tanpa API call
      dispatch(
        addToHistoryLocal({
          mal_id: parseInt(id),
          title: animeData.title_english || animeData.title,
          image: animeData.images?.jpg?.image_url,
          episodeNumber: currentEpNum,
          progress: Math.floor(progressSeconds),
          duration: duration || videoDuration,
        }),
      );
      return;
    }

    lastSaveRef.current = now;
    try {
      await userAPI.updateHistory({
        mal_id: parseInt(id),
        title: animeData.title_english || animeData.title,
        episodeNumber: currentEpNum,
        image: animeData.images?.jpg?.image_url,
        progress: Math.floor(progressSeconds),
        duration: duration || videoDuration,
      });

      dispatch(
        addToHistoryLocal({
          mal_id: parseInt(id),
          title: animeData.title_english || animeData.title,
          image: animeData.images?.jpg?.image_url,
          episodeNumber: currentEpNum,
          progress: Math.floor(progressSeconds),
          duration: duration || videoDuration,
        }),
      );
    } catch (err) {
      console.warn("Progress save failed:", err.message);
    }
  };

  // Handler: Change Episode
  const changeEpisode = (newEpNum) => {
    if (newEpNum < 1) return;
    if (episodeList.length > 0 && newEpNum > episodeList.length) return;

    setCurrentEpNum(newEpNum);
    setVideoUrl(getVideoUrl(newEpNum));
    navigate(`/watch/${id}?episode=${newEpNum}`, { replace: true });
  };

  const handleNext = () => changeEpisode(currentEpNum + 1);
  const handlePrev = () => changeEpisode(currentEpNum - 1);

  // Safe lookup for current episode info
  const currentEpisodeInfo = useMemo(() => {
    return (
      episodeList.find((ep) => ep.episode === currentEpNum) || {
        episode: currentEpNum,
        title: `Episode ${currentEpNum}`,
        aired: null,
      }
    );
  }, [episodeList, currentEpNum]);

  const hasPrev = currentEpNum > 1;
  const hasNext =
    episodeList.length === 0 ? true : currentEpNum < episodeList.length;

  const initialProgress = useMemo(() => {
    const historyItem = watchHistory?.find((h) => h.mal_id === parseInt(id));
    if (historyItem && historyItem.episodeNumber === currentEpNum) {
      return historyItem.progress || 0;
    }
    return 0;
  }, [id, currentEpNum]);
  // --- RENDER ---
  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading player...</p>
        </div>
      </div>
    );
  }

  if (error || !animeData) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">
            {error || "Content not found"}
          </p>
          <button
            onClick={() => navigate(`/anime/${id}`)}
            className="bg-primary px-6 py-2 rounded text-white font-semibold hover:bg-red-700 transition"
          >
            Back to Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Player Section */}
      <div className="w-full h-[70vh] md:h-[85vh] bg-black sticky top-0 z-50">
        <VideoPlayer
          videoUrl={videoUrl}
          episode={currentEpisodeInfo}
          onNext={handleNext}
          onPrev={handlePrev}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onProgressUpdate={handleProgressUpdate}
          initialProgress={initialProgress}
        />
      </div>

      {/* Info & Episode List */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {animeData.title_english || animeData.title}
          </h1>
          <p className="text-gray-400 text-lg">
            Episode {currentEpNum}: {currentEpisodeInfo.title}
          </p>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setShowEpisodeList(!showEpisodeList)}
          className="md:hidden w-full bg-dark-gray text-white py-3 rounded-lg font-semibold mb-4"
        >
          {showEpisodeList ? "Hide Episodes" : "Show Episodes"}
        </button>

        {/* Episode Grid */}
        <div className={`${showEpisodeList ? "block" : "hidden md:block"}`}>
          <h2 className="text-xl font-bold text-white mb-4">Episodes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {episodeList.length > 0
              ? episodeList.map((ep) => (
                  <button
                    key={ep.mal_id || ep.episode}
                    onClick={() => changeEpisode(ep.episode)}
                    className={`group p-4 rounded-lg border transition text-left ${
                      currentEpNum === ep.episode
                        ? "bg-primary/20 border-primary"
                        : "bg-dark-gray border-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center font-bold ${
                          currentEpNum === ep.episode
                            ? "bg-primary text-white"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {ep.episode}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold truncate ${
                            currentEpNum === ep.episode
                              ? "text-primary"
                              : "text-white group-hover:text-primary"
                          }`}
                        >
                          {ep.title || `Episode ${ep.episode}`}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {ep.aired
                            ? new Date(ep.aired).toLocaleDateString()
                            : "TBA"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              : // Fallback rendering if episodeList is empty
                Array.from(
                  { length: Math.min(animeData.episodes || 12, 24) },
                  (_, i) => {
                    const epNum = i + 1;
                    return (
                      <button
                        key={epNum}
                        onClick={() => changeEpisode(epNum)}
                        className={`group p-4 rounded-lg border transition text-left ${
                          currentEpNum === epNum
                            ? "bg-primary/20 border-primary"
                            : "bg-dark-gray border-gray-800 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded flex items-center justify-center font-bold ${
                              currentEpNum === epNum
                                ? "bg-primary text-white"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {epNum}
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-semibold ${currentEpNum === epNum ? "text-primary" : "text-white"}`}
                            >
                              Episode {epNum}
                            </h4>
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <button
            onClick={() => navigate(`/anime/${id}`)}
            className="text-primary hover:underline font-semibold"
          >
            ← Back to Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
