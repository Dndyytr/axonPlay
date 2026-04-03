import mongoose from "mongoose";

const animeCacheSchema = new mongoose.Schema(
  {
    mal_id: {
      type: Number,
      unique: true,
      required: true,
    },
    title: String,
    synopsis: String,
    coverImage: String,
    bannerImage: String,
    genres: [String],
    rating: Number,
    episodes: Number,
    status: String,
    aired: {
      from: Date,
      to: Date,
    },
    data: { type: mongoose.Schema.Types.Mixed },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create index for TTL (auto-delete expired cache)
// animeCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
animeCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AnimeCache", animeCacheSchema);
