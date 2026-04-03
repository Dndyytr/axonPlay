import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TrashIcon, PlayIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { fetchWatchlist, removeWatchlistItem } from "../store/userSlice";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const WatchlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { watchlist, loading } = useSelector(
    (state) => state.user || { watchlist: [], loading: false },
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/watchlist" } });
      return;
    }
    dispatch(fetchWatchlist());
  }, [dispatch, isAuthenticated, navigate]);

  const handleRemove = async (mal_id) => {
    if (confirm("Remove this anime from your watchlist?")) {
      try {
        await dispatch(removeWatchlistItem(mal_id)).unwrap();
      } catch (error) {
        alert(error || "Failed to remove from watchlist");
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-white/80 hover:text-white transition"
            >
              <ChevronLeftIcon className="w-8 h-8" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                My Watchlist
              </h1>
              <p className="text-gray-400 mt-1">
                {watchlist?.length || 0} anime
                {watchlist?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && (!watchlist || watchlist.length === 0) && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlayIcon className="w-12 h-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Your watchlist is empty
              </h2>
              <p className="text-gray-400 mb-6">
                Start adding anime you want to watch later!
              </p>
              <Link
                to="/"
                className="bg-primary px-8 py-3 rounded text-white font-semibold hover:bg-red-700 transition"
              >
                Browse Anime
              </Link>
            </div>
          )}

          {/* Watchlist Grid */}
          {!loading && watchlist && watchlist.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {watchlist.map((anime) => (
                <div
                  key={anime.mal_id}
                  className="group relative bg-dark-gray rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition"
                >
                  {/* Image */}
                  <Link
                    to={`/anime/${anime.mal_id}`}
                    className="block aspect-2/3"
                  >
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  </Link>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(anime.mal_id)}
                    className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                    title="Remove from watchlist"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  {/* Info */}
                  <div className="p-3">
                    <Link to={`/anime/${anime.mal_id}`}>
                      <h3 className="text-sm font-semibold text-white truncate hover:text-primary transition">
                        {anime.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {new Date(anime.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WatchlistPage;
