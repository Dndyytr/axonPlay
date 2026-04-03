import { Link } from "react-router-dom";
import { PlayIcon } from "@heroicons/react/24/solid";
import AddToWatchlistButton from "./AddToWatchlistButton";

const AnimeCard = ({ anime }) => {
  return (
    <div className="group relative shrink-0 w-36 md:w-44 lg:w-52">
      <Link to={`/anime/${anime.mal_id}`} className="block">
        <div className="relative aspect-2/3 rounded-md overflow-hidden bg-dark-gray">
          <img
            src={anime.images?.jpg?.large_image_url}
            alt={anime.title_english || anime.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
              <button className="w-full bg-white text-black py-2 rounded font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                <PlayIcon className="w-5 h-5" />
                Play
              </button>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
            <span
              className={
                anime.score >= 8 ? "text-green-400" : "text-yellow-400"
              }
            >
              ⭐ {anime.score || "N/A"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-2">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition">
            {anime.title_english || anime.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span>{anime.year || "N/A"}</span>
            <span>•</span>
            <span>{anime.episodes || "?"} eps</span>
          </div>
        </div>
      </Link>

      {/* Watchlist Button */}
      <div className="absolute top-2 left-2">
        <AddToWatchlistButton anime={anime} variant="icon" />
      </div>
    </div>
  );
};

export default AnimeCard;
