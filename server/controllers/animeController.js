import animeService from "../services/animeService.js";
import cacheService from "../services/cacheService.js";
import catchAsync from "../utils/catchAsync.js";

// Cache khusus list anime (pakai Map di memory, bukan MongoDB)
const listCache = new Map();

const getListCache = (key) => {
  const cached = listCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    listCache.delete(key);
    return null;
  }
  return cached.data;
};

const setListCache = (key, data, ttlSeconds = 300) => {
  listCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

// GET /api/v1/anime
export const getTopAnime = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, filter = "airing" } = req.query;
  const cacheKey = `top_${page}_${limit}_${filter}`;

  // ✅ Pakai memory cache untuk list
  const cached = getListCache(cacheKey);
  if (cached) {
    return res.status(200).json({
      status: "success",
      fromCache: true,
      results: cached.data.length,
      data: { anime: cached.data, pagination: cached.pagination },
    });
  }

  const result = await animeService.getTopAnime({
    page: parseInt(page),
    limit: parseInt(limit),
    filter,
  });

  setListCache(cacheKey, result);

  res.status(200).json({
    status: "success",
    fromCache: false,
    results: result.data.length,
    data: { anime: result.data, pagination: result.pagination },
  });
});

// GET /api/v1/anime/:id — tetap pakai MongoDB cache (mal_id = Number)
export const getAnimeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const malId = parseInt(id); // ✅ pastikan Number

  let anime = await cacheService.get(malId);

  if (!anime) {
    anime = await animeService.getAnimeById(malId);
    await cacheService.set(malId, anime, 3600);
  }

  res.status(200).json({
    status: "success",
    fromCache: !!anime,
    data: { anime },
  });
});

// GET /api/v1/anime/:id/episodes
export const getAnimeEpisodes = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;

  const result = await animeService.getAnimeEpisodes(id, {
    page: parseInt(page),
  });

  res.status(200).json({
    status: "success",
    results: result.data.length,
    data: { episodes: result.data, pagination: result.pagination },
  });
});

// GET /api/v1/anime/search
/**
 * Search Anime
 * GET /api/v1/anime/search
 */
export const searchAnime = catchAsync(async (req, res, next) => {
  const { q, page = 1, limit = 20, genre, rating, status, order } = req.query;

  // Validate search query
  if (!q || q.trim() === "") {
    return res.status(400).json({
      status: "fail",
      message: "Search query (q) is required",
    });
  }

  // Limit max results to prevent abuse
  const safeLimit = Math.min(parseInt(limit, 10) || 20, 50);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);

  const result = await animeService.searchAnime(q, {
    page: safePage,
    limit: safeLimit,
    genre,
    rating,
    status,
    order,
  });

  res.status(200).json({
    status: "success",
    results: result.data.length,
    data: {
      anime: result.data,
      pagination: result.pagination,
      query: q,
    },
  });
});

// GET /api/v1/anime/season/:year/:season
export const getSeasonalAnime = catchAsync(async (req, res) => {
  const { year, season } = req.params;
  const cacheKey = `season_${year}_${season}`;

  const cached = getListCache(cacheKey);
  if (cached) {
    return res.status(200).json({
      status: "success",
      fromCache: true,
      results: cached.data.length,
      data: { anime: cached.data, pagination: cached.pagination },
    });
  }

  const result = await animeService.getSeasonalAnime(year, season);
  setListCache(cacheKey, result, 600); // cache 10 menit

  res.status(200).json({
    status: "success",
    fromCache: false,
    results: result.data.length,
    data: { anime: result.data, pagination: result.pagination },
  });
});

// GET /api/v1/anime/random
export const getRandomAnime = catchAsync(async (req, res) => {
  const anime = await animeService.getRandomAnime();

  res.status(200).json({
    status: "success",
    data: { anime },
  });
});
