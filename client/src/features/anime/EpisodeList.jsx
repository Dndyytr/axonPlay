import { Link } from "react-router-dom";
import { PlayCircleIcon } from "@heroicons/react/24/solid";

const EpisodeList = ({ episodes, animeId }) => {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No episodes available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {episodes.map((episode, index) => {
          // ✅ Jikan pakai mal_id sebagai nomor episode, bukan field "episode"
          const epNum = episode.episode ?? episode.mal_id ?? index + 1;
          const epTitle = episode.title || `Episode ${epNum}`;

          return (
            <Link
              key={epNum}
              to={`/watch/${animeId}?episode=${epNum}`} // ✅ tidak akan undefined
              className="group bg-dark-gray rounded-lg overflow-hidden hover:bg-gray-800 transition border border-gray-800 hover:border-gray-700"
            >
              <div className="flex gap-4 p-4">
                <div className="shrink-0 w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">
                    {epNum}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate group-hover:text-primary transition">
                    {epTitle}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {episode.aired
                      ? new Date(episode.aired).toLocaleDateString()
                      : "TBA"}
                  </p>
                  {episode.filler && (
                    <span className="inline-block bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded mt-1">
                      Filler
                    </span>
                  )}
                  {episode.recap && (
                    <span className="inline-block bg-blue-500/20 text-blue-500 text-xs px-2 py-0.5 rounded mt-1">
                      Recap
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  <PlayCircleIcon className="w-10 h-10 text-gray-600 group-hover:text-primary transition" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center text-gray-400 text-sm">
        Showing {episodes.length} episodes
      </div>
    </div>
  );
};

export default EpisodeList;
