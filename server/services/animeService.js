import axios from "axios";
import AppError from "../utils/AppError.js";

// Jikan API Base URL
const JIKAN_API_BASE = process.env.JIKAN_API_BASE || "https://api.jikan.moe/v4";

// Create axios instance with custom config
const jikanApi = axios.create({
  baseURL: JIKAN_API_BASE,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "User-Agent": "axonPlay/1.0 (https://axonplay.com)",
  },
});

// Request interceptor for rate limiting info
jikanApi.interceptors.request.use((config) => {
  console.log(
    `📡 Jikan API Request: ${config.method?.toUpperCase()} ${config.url}`,
  );
  return config;
});

// Response interceptor for error handling
jikanApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Jikan API returns 429 for rate limiting
      if (error.response.status === 429) {
        console.warn("⚠️ Jikan API Rate Limit Exceeded");
      }
      console.error(`❌ Jikan API Error: ${error.response.status}`);
    } else if (error.request) {
      console.error("❌ Jikan API No Response:", error.request);
    } else {
      console.error("❌ Jikan API Request Error:", error.message);
    }
    return Promise.reject(error);
  },
);

// Tambah helper di atas class AnimeService
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const jikanRequest = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isTimeout = error.code === "ECONNABORTED";
      if ((isRateLimit || isTimeout) && i < retries - 1) {
        const wait = 2000 * (i + 1); // ✅ 2s, 4s, 6s — lebih panjang
        console.warn(`⏳ Retry ${i + 1}/${retries} setelah ${wait}ms...`);
        await delay(wait);
        continue;
      }
      throw error;
    }
  }
};

class AnimeService {
  /**
   * Search Anime from Jikan API
   * @param {string} query - Search keyword
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} - Search results
   */
  async searchAnime(query, options = {}) {
    try {
      const { page = 1, limit = 20, genre, rating, status, order } = options;

      if (!query || query.trim() === "") {
        throw new AppError("Search query is required", 400);
      }

      const response = await jikanRequest(() =>
        jikanApi.get("/anime", {
          params: {
            q: query.trim(),
            page,
            limit,
            genre,
            rating, // g, pg, pg13, r17, r, rx
            status, // airing, complete
            order_by: order || "relevance", // relevance, popularity, rating, etc.
            sort: "desc",
          },
        }),
      );

      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError("No anime found matching your search", 404);
      }
      if (error.response?.status === 429) {
        throw new AppError(
          "API rate limit exceeded. Please try again later.",
          503,
        );
      }
      throw new AppError("Failed to search anime", 503);
    }
  }

  /**
   * Get trending/top anime
   * @param {Object} options - Pagination and filter options
   * @returns {Promise<Object>} - Anime list data
   */
  async getTopAnime(options = {}) {
    try {
      const { page = 1, limit = 10, filter = "airing" } = options;

      const response = await jikanRequest(() =>
        jikanApi.get("/top/anime", {
          params: { page, limit, filter },
        }),
      );

      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new AppError("Failed to fetch top anime: " + error.message, 503);
    }
  }

  /**
   * Get anime by ID
   * @param {number} id - MyAnimeList ID
   * @returns {Promise<Object>} - Anime detail data
   */
  async getAnimeById(id) {
    try {
      const response = await jikanRequest(() => jikanApi.get(`/anime/${id}`));

      // const response = await jikanApi.get(`/anime/${id}`);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError("Anime not found", 404);
      }
      throw new AppError("Failed to fetch anime details", 503);
    }
  }

  /**
   * Get anime episodes
   * @param {number} id - MyAnimeList ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} - Episodes data
   */
  async getAnimeEpisodes(id, options = {}) {
    try {
      const { page = 1 } = options;

      const response = await jikanRequest(() =>
        jikanApi.get(`/anime/${id}/episodes`, {
          params: { page },
        }),
      );

      // const response = await jikanApi.get(`/anime/${id}/episodes`, {
      //   params: { page },
      // });

      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError("Episodes not found for this anime", 404);
      }
      throw new AppError("Failed to fetch episodes", 503);
    }
  }

  /**
   * Search anime by query
   * @param {string} query - Search keyword
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} - Search results
   */
  async searchAnime(query, options = {}) {
    try {
      const { page = 1, limit = 10, genre, rating, status } = options;

      const response = await jikanRequest(() =>
        jikanApi.get("/anime", {
          params: {
            q: query,
            page,
            limit,
            genre,
            rating, // g, pg, pg13, r17, r, rx
            status, // airing, complete
          },
        }),
      );

      // const response = await jikanApi.get("/anime", {
      //   params: {
      //     q: query,
      //     page,
      //     limit,
      //     genre,
      //     rating, // g, pg, pg13, r17, r, rx
      //     status, // airing, complete
      //   },
      // });

      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new AppError("Failed to search anime:" + error.message, 503);
    }
  }

  /**
   * Get seasonal anime
   * @param {number} year - Year (e.g., 2024)
   * @param {string} season - Season (winter, spring, summer, fall)
   * @returns {Promise<Object>} - Seasonal anime data
   */
  async getSeasonalAnime(year, season) {
    try {
      const response = await jikanRequest(() =>
        jikanApi.get(`/seasons/${year}/${season}`),
      );
      // const response = await jikanApi.get(`/seasons/${year}/${season}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new AppError(
        "Failed to fetch seasonal anime:" + error.message,
        503,
      );
    }
  }

  /**
   * Get random anime
   * @returns {Promise<Object>} - Random anime data
   */
  async getRandomAnime() {
    try {
      const response = await jikanRequest(() => jikanApi.get("/random/anime"));
      // const response = await jikanApi.get("/random/anime");
      return response.data.data;
    } catch (error) {
      throw new AppError("Failed to fetch random anime:" + error.message, 503);
    }
  }
}

// Export singleton instance
export default new AnimeService();
