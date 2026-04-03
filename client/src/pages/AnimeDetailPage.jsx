import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  PlayIcon,
  PlusIcon,
  CheckIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { animeAPI } from "../services/api";
import { userAPI } from "../services/api";
import { addToWatchlist, removeFromWatchlist } from "../store/userSlice";
import EpisodeList from "../features/anime/EpisodeList";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AddToWatchlistButton from "../features/anime/AddToWatchListButton";
import ReviewSection from "../features/review/ReviewSection";

const AnimeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { watchlist } = useSelector((state) => state.user || { watchlist: [] });

  const [anime, setAnime] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("episodes"); // 'episodes' | 'reviews'

  useEffect(() => {
    const fetchAnimeDetail = async () => {
      try {
        setLoading(true);
        const response = await animeAPI.getById(id);
        setAnime(response.data.data.anime);

        // Fetch episodes (optional - can be slow)
        try {
          const epResponse = await animeAPI.getEpisodes(id, { page: 1 });
          setEpisodesList(epResponse.data.data.episodes || []);
        } catch (epError) {
          console.warn("Could not fetch episodes:", epError.message);
          // Set dummy episodes if API fails
          setEpisodesList(
            generateDummyEpisodes(response.data.data.anime.episodes || 12),
          );
        }
      } catch (err) {
        console.error("Failed to fetch anime detail:", err);
        setError(err.response?.data?.message || "Failed to load anime details");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetail();
    window.scrollTo(0, 0);
  }, [id]);

  // Generate dummy episodes if API doesn't provide them
  const generateDummyEpisodes = (count) => {
    return Array.from({ length: Math.min(count, 24) }, (_, i) => ({
      mal_id: i + 1,
      title: `Episode ${i + 1}`,
      episode: i + 1,
      aired: new Date().toISOString(),
      filler: false,
      recap: false,
    }));
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      alert("Please login to add to watchlist");
      navigate("/login");
      return;
    }

    try {
      const isInList = watchlist?.some((item) => item.mal_id === anime.mal_id);

      if (isInList) {
        await userAPI.removeFromWatchlist(anime.mal_id);
        dispatch(removeFromWatchlist(anime.mal_id));
      } else {
        await userAPI.addToWatchlist({
          mal_id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images?.jpg?.image_url,
        });
        dispatch(
          addToWatchlist({
            mal_id: anime.mal_id,
            title: anime.title_english || anime.title,
            image: anime.images?.jpg?.image_url,
          }),
        );
      }
    } catch (err) {
      console.error("Failed to update watchlist:", err);
    }
  };

  const handleWatchNow = () => {
    if (!isAuthenticated) {
      alert("Please login to watch");
      navigate("/login");
      return;
    }
    navigate(`/watch/${id}?episode=1`); // ✅ selalu mulai dari episode 1
  };

  const isInWatchlist = watchlist?.some(
    (item) => item.mal_id === anime?.mal_id,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading anime details...</p>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">
            {error || "Anime not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary px-6 py-2 rounded text-white font-semibold hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const backdropUrl = anime.images?.jpg?.large_image_url;
  const posterUrl = anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  const japaneseTitle = anime.title_japanese;
  const synopsis = anime.synopsis || "No synopsis available.";
  const rating = anime.score || "N/A";
  const rank = anime.rank || "#N/A";
  const popularity = anime.popularity || "#N/A";
  const members = anime.members?.toLocaleString() || "0";
  const year = anime.year || anime.aired?.from?.split("-")[0] || "N/A";
  const status = anime.status || "Unknown";
  const duration = anime.duration?.split(" ")[0] || "N/A";
  const episodes = anime.episodes || "?";
  const genres = anime.genres?.map((g) => g.name) || [];
  const studios = anime.studios?.map((s) => s.name) || [];

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Hero Banner with Backdrop */}
      <section className="relative h-[70vh] md:h-[85vh]">
        {/* Backdrop Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-r from-dark via-dark/85 to-dark/40" />
        <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/60 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 md:left-12 z-30 flex items-center gap-2 text-white/80 hover:text-white transition"
        >
          <ChevronLeftIcon className="w-8 h-8" />
          <span className="hidden md:inline font-semibold">Back</span>
        </button>

        {/* Content */}
        <div className="relative z-20 h-full flex items-end pb-12 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-12 w-full">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Poster */}
              <div className="shrink-0 w-40 md:w-64 lg:w-72 mx-auto md:mx-0">
                <div className="aspect-2/3 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                {/* Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                  {title}
                </h1>
                {japaneseTitle && (
                  <p className="text-gray-400 text-lg mb-4">{japaneseTitle}</p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm mb-6">
                  <span className="text-green-400 font-semibold flex items-center gap-1">
                    <StarIcon className="w-5 h-5" /> {rating} Match
                  </span>
                  <span className="text-gray-300">{year}</span>
                  <span className="border border-gray-500 px-2 py-0.5 text-xs">
                    HD
                  </span>
                  <span className="text-gray-400">{episodes} Episodes</span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                  {genres.slice(0, 6).map((genre) => (
                    <span
                      key={genre}
                      className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                  <button
                    onClick={handleWatchNow}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-semibold hover:bg-gray-200 transition"
                  >
                    <PlayIcon className="w-6 h-6" />
                    Watch Now
                  </button>
                  {/* Use the reusable component */}
                  <AddToWatchlistButton anime={anime} variant="full" />
                  <button
                    onClick={handleAddToWatchlist}
                    className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition ${
                      isInWatchlist
                        ? "bg-gray-700 text-green-400 hover:bg-gray-600"
                        : "bg-gray-800/80 text-white hover:bg-gray-700 backdrop-blur-sm"
                    }`}
                  >
                    {isInWatchlist ? (
                      <>
                        <CheckIcon className="w-6 h-6" />
                        In List
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-6 h-6" />
                        My List
                      </>
                    )}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>{duration} / ep</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Studio: </span>
                    <span className="text-gray-300">{studios[0] || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rank: </span>
                    <span className="text-gray-300">{rank}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("episodes")}
            className={`pb-3 font-semibold transition ${
              activeTab === "episodes"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Episodes
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 font-semibold transition ${
              activeTab === "reviews"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Episodes Tab */}
        {activeTab === "episodes" && (
          <EpisodeList episodes={episodesList} animeId={id} />
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && <ReviewSection animeId={id} />}

        {/* Synopsis */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {synopsis}
          </p>
        </div>

        {/* Info Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-gray-500 w-32">Type:</span>
                <span className="text-gray-300">{anime.type || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">Source:</span>
                <span className="text-gray-300">{anime.source || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">Aired:</span>
                <span className="text-gray-300">
                  {anime.aired?.string || "N/A"}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">Popularity:</span>
                <span className="text-gray-300">#{popularity}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">Members:</span>
                <span className="text-gray-300">{members}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="bg-gray-800 px-3 py-1 rounded text-sm text-gray-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AnimeDetailPage;
