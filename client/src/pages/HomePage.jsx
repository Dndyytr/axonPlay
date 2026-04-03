import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { animeAPI, userAPI } from "../services/api";
import HeroBanner from "../features/home/HeroBanner";
import AnimeRow from "../features/anime/AnimeRow";
import ContinueWatchingRow from "../features/home/ContinueWatchingRow";
import { addToWatchlist } from "../store/userSlice.js";
import { fetchHistory } from "../store/userSlice.js";

// ✅ Helper delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const animeCache = {
  data: null,
  fetchedAt: null,
  TTL: 5 * 60 * 1000, // 5 menit

  isValid() {
    return (
      this.data && this.fetchedAt && Date.now() - this.fetchedAt < this.TTL
    );
  },

  set(data) {
    this.data = data;
    this.fetchedAt = Date.now();
  },

  get() {
    return this.isValid() ? this.data : null;
  },
};

const HomePage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { watchlist, watchHistory } = useSelector(
    (state) => state.user || { watchlist: [], watchHistory: [] },
  );

  const [animeData, setAnimeData] = useState({
    trending: [],
    popular: [],
    upcoming: [],
    topRated: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Skip fetch kalau data sudah ada
    if (animeData.trending.length > 0) return;
    const fetchAllAnime = async () => {
      // ✅ Cek cache dulu sebelum fetch
      const cached = animeCache.get();
      if (cached) {
        setAnimeData(cached);
        setLoading(false);
        return; // ← tidak fetch ke server sama sekali
      }

      try {
        setError(null);

        // ✅ Sequential fetch dengan jeda 400ms antar request
        // Jikan limit 3 req/detik — aman dengan jeda ini
        const trending = await animeAPI.getTop({ limit: 15, filter: "airing" });
        await delay(400);

        const popular = await animeAPI.getTop({
          limit: 15,
          filter: "bypopularity",
        });
        await delay(400);

        const upcoming = await animeAPI.getTop({
          limit: 15,
          filter: "upcoming",
        });
        await delay(400);

        const topRated = await animeAPI.getTop({
          limit: 15,
          filter: "favorite",
        });

        const result = {
          trending: trending.data.data.anime,
          popular: popular.data.data.anime,
          upcoming: upcoming.data.data.anime,
          topRated: topRated.data.data.anime,
        };

        animeCache.set(result); // ✅ simpan ke cache
        setAnimeData(result);
      } catch (error) {
        console.error("Failed to fetch anime:", error);
        setError("Gagal memuat data anime. Coba refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnime();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchHistory());
    }
  }, [isAuthenticated, dispatch]);

  const handleAddToWatchlist = async (anime) => {
    if (!isAuthenticated) {
      alert("Please login to add to watchlist");
      return;
    }
    try {
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
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      alert("Failed to add to watchlist");
    }
  };

  const watchlistIds = watchlist?.map((item) => item.mal_id) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading anime...</p>
        </div>
      </div>
    );
  }

  // ✅ Tampilkan error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <HeroBanner />

      <div className="relative z-20 -mt-32 md:-mt-48 pb-12">
        {/* Continue Watching - Show only if authenticated and has history */}
        {isAuthenticated && watchHistory && watchHistory.length > 0 && (
          <ContinueWatchingRow
            history={watchHistory}
            onFetchHistory={() => dispatch(fetchHistory())}
          />
        )}

        <AnimeRow
          title="🔥 Trending Now"
          animeList={animeData.trending}
          onAddToWatchlist={handleAddToWatchlist}
          watchlistIds={watchlistIds}
        />
        <AnimeRow
          title="👥 Most Popular"
          animeList={animeData.popular}
          onAddToWatchlist={handleAddToWatchlist}
          watchlistIds={watchlistIds}
        />
        <AnimeRow
          title="📅 Coming Soon"
          animeList={animeData.upcoming}
          onAddToWatchlist={handleAddToWatchlist}
          watchlistIds={watchlistIds}
        />
        <AnimeRow
          title="⭐ Top Rated"
          animeList={animeData.topRated}
          onAddToWatchlist={handleAddToWatchlist}
          watchlistIds={watchlistIds}
        />
      </div>
    </div>
  );
};

export default HomePage;
