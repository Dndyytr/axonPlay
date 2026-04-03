import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    animeMalId: {
      type: Number,
      required: [true, "Review must belong to an anime"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    helpful: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate reviews per user per anime
reviewSchema.index({ user: 1, animeMalId: 1 }, { unique: true });

// Populate user info in queries
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "username avatar",
  });
});

reviewSchema.virtual("helpfulCount").get(function () {
  return this.helpful.length;
});

reviewSchema.set("toJSON", { virtuals: true });
reviewSchema.set("toObject", { virtuals: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (animeMalId) {
  const stats = await this.aggregate([
    {
      $match: { animeMalId },
    },
    {
      $group: {
        _id: "$animeMalId",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    return {
      nRating: stats[0].nRating,
      avgRating: stats[0].avgRating,
    };
  }
  return { nRating: 0, avgRating: 0 };
};

// Hook to update anime rating after review save/delete
reviewSchema.post("save", async function () {
  const Review = this.constructor;
  const stats = await Review.calcAverageRating(this.animeMalId);

  // You can store this in an AnimeCache model if needed
  console.log(
    `Updated rating for anime ${this.animeMalId}: ${stats.avgRating.toFixed(1)}`,
  );
});

export default mongoose.model("Review", reviewSchema);
