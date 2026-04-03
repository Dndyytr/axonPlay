import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PlusIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/solid";
import { addWatchlistItem, removeWatchlistItem } from "../../store/userSlice";

const AddToWatchlistButton = ({ anime, variant = "icon" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { watchlist } = useSelector((state) => state.user || { watchlist: [] });
  const [loading, setLoading] = useState(false);

  const isInWatchlist = watchlist?.some((item) => item.mal_id === anime.mal_id);

  const handleClick = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    setLoading(true);
    try {
      if (isInWatchlist) {
        await dispatch(removeWatchlistItem(anime.mal_id)).unwrap();
      } else {
        await dispatch(
          addWatchlistItem({
            mal_id: anime.mal_id,
            title: anime.title_english || anime.title,
            image: anime.images?.jpg?.image_url,
          }),
        ).unwrap();
      }
    } catch (error) {
      console.error("Watchlist error:", error);
      alert(error || "Failed to update watchlist");
    } finally {
      setLoading(false);
    }
  };

  // Icon button variant (for cards)
  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`p-2 rounded-full transition ${
          isInWatchlist
            ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
            : "bg-gray-800/80 text-white hover:bg-gray-700"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isInWatchlist ? (
          <CheckIcon className="w-5 h-5" />
        ) : (
          <PlusIcon className="w-5 h-5" />
        )}
      </button>
    );
  }

  // Full button variant (for detail page)
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition ${
        isInWatchlist
          ? "bg-gray-700 text-green-400 hover:bg-gray-600"
          : "bg-gray-800/80 text-white hover:bg-gray-700 backdrop-blur-sm"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : isInWatchlist ? (
        <>
          <CheckIcon className="w-6 h-6" />
          <span>In List</span>
        </>
      ) : (
        <>
          <PlusIcon className="w-6 h-6" />
          <span>My List</span>
        </>
      )}
    </button>
  );
};

export default AddToWatchlistButton;
