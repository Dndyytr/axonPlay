import AnimeCache from "../models/AnimeCache.js";

class CacheService {
  /**
   * Get cached data
   * @param {number} malId - MyAnimeList ID
   * @returns {Promise<Object|null>} - Cached data or null
   */
  async get(malId) {
    try {
      const cache = await AnimeCache.findOne({
        mal_id: malId,
        expiresAt: { $gt: new Date() },
      });

      if (cache) {
        console.log(`✅ Cache hit for MAL ID: ${malId}`);
        return cache.data;
      }

      console.log(`⏳ Cache miss for MAL ID: ${malId}`);
      return null;
    } catch (error) {
      console.error("❌ Cache get error:", error.message);
      return null;
    }
  }

  /**
   * Set cache data
   * @param {number} malId - MyAnimeList ID
   * @param {Object} data - Data to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 1 hour)
   */
  async set(malId, data, ttlSeconds = 3600) {
    try {
      await AnimeCache.findOneAndUpdate(
        { mal_id: malId },
        {
          mal_id: malId,
          title: data.title,
          synopsis: data.synopsis,
          coverImage: data.images?.jpg?.image_url,
          bannerImage: data.images?.jpg?.large_image_url,
          genres: data.genres?.map((g) => g.name) || [],
          rating: data.score,
          episodes: data.episodes,
          status: data.status,
          aired: data.aired,
          data,
          expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        },
        { upsert: true, new: true },
      );

      console.log(`💾 Cached MAL ID: ${malId} for ${ttlSeconds}s`);
    } catch (error) {
      console.error("❌ Cache set error:", error.message);
    }
  }

  /**
   * Delete cache
   * @param {number} malId - MyAnimeList ID
   */
  async delete(malId) {
    try {
      await AnimeCache.deleteOne({ mal_id: malId });
      console.log(`🗑️ Deleted cache for MAL ID: ${malId}`);
    } catch (error) {
      console.error("❌ Cache delete error:", error.message);
    }
  }

  /**
   * Clear all expired cache (manual cleanup)
   */
  async clearExpired() {
    try {
      const result = await AnimeCache.deleteMany({
        expiresAt: { $lte: new Date() },
      });
      console.log(`🧹 Cleared ${result.deletedCount} expired cache entries`);
    } catch (error) {
      console.error("❌ Cache clear error:", error.message);
    }
  }
}

export default new CacheService();
