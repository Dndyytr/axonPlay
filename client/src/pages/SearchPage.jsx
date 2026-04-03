import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MagnifyingGlassIcon, FilmIcon } from "@heroicons/react/24/outline";
import useDebounce from "../hooks/useDebounce";
import { animeAPI } from "../services/api";
import AnimeCard from "../features/anime/AnimeCard";
import SearchBar from "../features/search/SearchBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  });

  // Get search query from URL
  const searchQuery = searchParams.get("q") || "";

  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Fetch search results when debounced query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedQuery || debouncedQuery.trim() === "") {
        setAnimeList([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await animeAPI.search(debouncedQuery, {
          limit: 20,
        });

        setAnimeList(response.data.data.anime || []);
        setPagination({
          page: response.data.data.pagination?.current_page || 1,
          limit: 20,
          totalPages: response.data.data.pagination?.last_visible_page || 1,
          hasMore: response.data.data.pagination?.has_next_page || false,
        });
      } catch (err) {
        console.error("Search error:", err);
        setError(err.response?.data?.message || "Failed to search anime");
        setAnimeList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {/* Header */}
          <div className="py-8">
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Search Anime
              </h1>
              <SearchBar initialValue={searchQuery} />
            </div>
          </div>

          {/* Search Results Info */}
          {debouncedQuery && !loading && (
            <div className="mb-6 text-gray-400">
              {animeList.length > 0 ? (
                <p>
                  Found{" "}
                  <span className="text-white font-semibold">
                    {animeList.length}
                  </span>{" "}
                  results for{" "}
                  <span className="text-primary">"{debouncedQuery}"</span>
                </p>
              ) : (
                <p>
                  No results found for{" "}
                  <span className="text-primary">"{debouncedQuery}"</span>
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Searching anime...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg text-center">
              <p className="font-semibold">Search Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Empty State - No Query */}
          {!debouncedQuery && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Find Your Favorite Anime
              </h2>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Search by title, genre, or status. Discover new anime to add to
                your watchlist.
              </p>
              <Link
                to="/"
                className="bg-primary px-6 py-3 rounded text-white font-semibold hover:bg-red-700 transition"
              >
                Browse Popular Anime
              </Link>
            </div>
          )}

          {/* Empty State - No Results */}
          {!loading && !error && debouncedQuery && animeList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <FilmIcon className="w-12 h-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No Results Found
              </h2>
              <p className="text-gray-400 text-center max-w-md mb-6">
                We couldn't find any anime matching "{debouncedQuery}". Try
                different keywords or browse our collection.
              </p>
              <Link
                to="/"
                className="bg-primary px-6 py-3 rounded text-white font-semibold hover:bg-red-700 transition"
              >
                Browse Popular Anime
              </Link>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && animeList.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {animeList.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>

              {/* Pagination Info */}
              {pagination.hasMore && (
                <div className="mt-8 text-center text-gray-400">
                  <p>
                    Showing page {pagination.page} of {pagination.totalPages}
                  </p>
                  <p className="text-sm">More results available on Jikan API</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
