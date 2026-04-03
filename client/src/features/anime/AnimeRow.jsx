import { useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import AnimeCard from "./AnimeCard";

const AnimeRow = ({
  title,
  animeList,
  onAddToWatchlist,
  watchlistIds = [],
}) => {
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

      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (!animeList || animeList.length === 0) return null;

  return (
    <section className="py-6 relative group/row">
      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-12">
        {title}
      </h2>

      {/* Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-0 z-40 w-12 bg-linear-to-r from-dark to-transparent flex items-center justify-center transition-opacity duration-300 ${
            showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-8 h-8 text-white hover:scale-125 transition" />
        </button>

        {/* Anime Cards Container */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {animeList.map((anime, index) => (
            <AnimeCard
              key={`${anime.mal_id}-${index}`}
              anime={anime}
              onAddToWatchlist={onAddToWatchlist}
              isInWatchlist={watchlistIds.includes(anime.mal_id)}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 z-40 w-12 bg-linear-to-l from-dark to-transparent flex items-center justify-center transition-opacity duration-300 ${
            showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-8 h-8 text-white hover:scale-125 transition" />
        </button>
      </div>
    </section>
  );
};

export default AnimeRow;
