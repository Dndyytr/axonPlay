import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { animeAPI } from "../../services/api";

const HeroBanner = () => {
  const [featuredAnime, setFeaturedAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Get top anime and pick one randomly for hero
        const response = await animeAPI.getTop({ limit: 20, filter: "airing" });
        const randomIndex = Math.floor(
          Math.random() * response.data.data.anime.length,
        );
        setFeaturedAnime(response.data.data.anime[randomIndex]);
      } catch (error) {
        console.error("Failed to fetch featured anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading || !featuredAnime) {
    return <div className="relative h-[80vh] bg-dark-gray animate-pulse" />;
  }

  const backdropUrl = featuredAnime.images?.jpg?.large_image_url;
  const title = featuredAnime.title_english || featuredAnime.title;
  const synopsis =
    featuredAnime.synopsis?.split("\n")[0]?.slice(0, 150) + "..." || "";
  const rating = featuredAnime.score || "N/A";
  const year =
    featuredAnime.year || featuredAnime.aired?.from?.split("-")[0] || "N/A";

  return (
    <section className="relative h-[80vh] md:h-[90vh] w-full">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backdropUrl})`,
        }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-r from-dark via-dark/70 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-dark via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-12 w-full">
          <div className="max-w-2xl">
            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              {title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm md:text-base text-gray-300 mb-4">
              <span className="text-green-400 font-semibold">
                ⭐ {rating} Match
              </span>
              <span>{year}</span>
              <span className="border border-gray-500 px-2 py-0.5 text-xs">
                HD
              </span>
            </div>

            {/* Synopsis */}
            <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3">
              {synopsis}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                to={`/watch/${featuredAnime.mal_id}`}
                className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-3 rounded font-semibold hover:bg-gray-200 transition"
              >
                <PlayIcon className="w-6 h-6" />
                Play Now
              </Link>
              <Link
                to={`/anime/${featuredAnime.mal_id}`}
                className="flex items-center gap-2 bg-gray-600/80 text-white px-6 md:px-8 py-3 rounded font-semibold hover:bg-gray-600 transition backdrop-blur-sm"
              >
                <InformationCircleIcon className="w-6 h-6" />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
