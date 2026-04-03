import Review from "../models/Review.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Get Reviews for Specific Anime
 * GET /api/v1/reviews/anime/:animeId
 */
export const getAnimeReviews = catchAsync(async (req, res, next) => {
  const { animeId } = req.params;
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const reviews = await Review.find({ animeMalId: parseInt(animeId) })
    .sort(sort)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Review.countDocuments({ animeMalId: parseInt(animeId) });

  const stats = await Review.calcAverageRating(parseInt(animeId));

  res.status(200).json({
    status: "success",
    results: reviews.length,
    total,
    data: {
      reviews,
      averageRating: stats.avgRating.toFixed(1),
      totalReviews: stats.nRating,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * Create New Review
 * POST /api/v1/reviews
 */
export const createReview = catchAsync(async (req, res, next) => {
  const { animeMalId, rating, comment } = req.body;
  const userId = req.user.id;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  // Check if user already reviewed this anime
  const existing = await Review.findOne({
    user: userId,
    animeMalId,
  });

  if (existing) {
    return next(new AppError("You have already reviewed this anime", 400));
  }

  const review = await Review.create({
    user: userId,
    animeMalId,
    rating,
    comment,
  });

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: { review },
  });
});

/**
 * Update User's Own Review
 * PATCH /api/v1/reviews/:id
 */
export const updateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  const reviewUserId = review.user._id.toString();

  // Check if user owns this review
  if (reviewUserId !== userId) {
    return next(new AppError("You can only update your own review", 403));
  }

  // Update fields
  if (rating) {
    if (rating < 1 || rating > 5) {
      return next(new AppError("Rating must be between 1 and 5", 400));
    }
    review.rating = rating;
  }

  if (comment) {
    review.comment = comment;
  }

  review.isEdited = true;
  await review.save();

  res.status(200).json({
    status: "success",
    message: "Review updated successfully",
    data: { review },
  });
});

/**
 * Delete User's Own Review
 * DELETE /api/v1/reviews/:id
 */
export const deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // ✅ FIXED: Akses _id dari object user
  const reviewUserId = review.user._id.toString();

  // Check if user owns this review OR is admin
  if (reviewUserId !== userId && req.user.role !== "admin") {
    return next(new AppError("You can only delete your own review", 403));
  }

  await Review.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    message: "Review deleted successfully",
  });
});

/**
 * Get User's Own Reviews
 * GET /api/v1/reviews/my-reviews
 */
export const getMyReviews = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({ user: userId })
    .sort("-createdAt")
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Review.countDocuments({ user: userId });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    total,
    data: { reviews },
  });
});

/**
 * Mark Review as Helpful
 * POST /api/v1/reviews/:id/helpful
 */
export const markHelpful = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // ✅ Gunakan findById tanpa populate untuk markHelpful
  const review = await Review.findById(id).populate("user", "username");

  if (!review) return next(new AppError("Review not found", 404));

  if (review.user._id.toString() === userId) {
    return next(new AppError("You cannot like your own review", 400));
  }

  // ✅ Extract _id dengan benar — handle populated object dan raw ObjectId
  const alreadyLiked = review.helpful.some((u) => {
    const uid = u?._id ? u._id.toString() : u.toString();
    return uid === userId;
  });

  if (alreadyLiked) {
    // Unlike — filter pakai cara yang sama
    review.helpful = review.helpful.filter((u) => {
      const uid = u?._id ? u._id.toString() : u.toString();
      return uid !== userId;
    });
  } else {
    review.helpful.push(userId);
  }

  await review.save();

  res.status(200).json({
    status: "success",
    data: {
      liked: !alreadyLiked,
      likes: review.helpful.length,
    },
  });
});
