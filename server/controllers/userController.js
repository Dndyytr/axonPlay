import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

export const getWatchlist = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: "success",
    results: user.watchlist.length,
    data: { watchlist: user.watchlist },
  });
});

export const addToWatchlist = catchAsync(async (req, res, next) => {
  const { mal_id, title, image } = req.body;
  const user = await User.findById(req.user.id);

  // Validate input
  if (!mal_id || !title) {
    return next(new AppError("mal_id and title are required", 400));
  }

  const exists = user.watchlist.some((item) => item.mal_id === mal_id);
  if (exists) {
    return next(new AppError("Already in watchlist", 400));
  }

  user.watchlist.push({ mal_id, title, image });
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Added to watchlist",
    data: { watchlist: user.watchlist },
  });
});

export const removeFromWatchlist = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id);

  const malId = parseInt(id, 10);
  if (isNaN(malId)) {
    return next(new AppError("Invalid watchlist ID", 400));
  }

  // Check if exists
  const exists = user.watchlist.some((item) => item.mal_id === malId);
  if (!exists) {
    return next(new AppError("Anime not in watchlist", 404));
  }

  user.watchlist = user.watchlist.filter((item) => item.mal_id !== malId);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Removed from watchlist",
    data: { watchlist: user.watchlist },
  });
});

export const getHistory = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("watchHistory");
  user.watchHistory.sort(
    (a, b) => new Date(b.lastWatched) - new Date(a.lastWatched),
  );

  res.status(200).json({
    status: "success",
    results: user.watchHistory.length,
    data: {
      history: user.watchHistory,
    },
  });
});

export const updateHistory = catchAsync(async (req, res, next) => {
  const { mal_id, title, image, episodeNumber, progress, duration } = req.body;
  const user = await User.findById(req.user.id);

  if (!mal_id) {
    return next(new AppError("mal_id is required", 400));
  }

  const existingIndex = user.watchHistory.findIndex((h) => h.mal_id === mal_id);

  if (existingIndex !== -1) {
    // Update existing history
    const existing = user.watchHistory[existingIndex];
    existing.episodeNumber = episodeNumber || existing.episodeNumber;
    existing.progress = progress !== undefined ? progress : existing.progress;
    existing.duration = duration || existing.duration;
    existing.lastWatched = Date.now();
    existing.image = image || existing.image;
    existing.title = title || existing.title;

    // Move to top of array (most recent first)
    user.watchHistory.splice(existingIndex, 1);
    user.watchHistory.unshift(existing);
  } else {
    // Create new history entry
    user.watchHistory.unshift({
      mal_id,
      title: title || "Unknown",
      image: image || "",
      episodeNumber: episodeNumber || 1,
      progress: progress || 0,
      duration: duration || 0,
      lastWatched: Date.now(),
    });
  }

  // Keep only last 50 items
  if (user.watchHistory.length > 50) {
    user.watchHistory = user.watchHistory.slice(0, 50);
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "History updated",
    data: {
      history: user.watchHistory,
    },
  });
});

export const removeFromHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id);

  const malId = parseInt(id, 10);
  if (isNaN(malId)) {
    return next(new AppError("Invalid history ID", 400));
  }

  const exists = user.watchHistory.some((h) => h.mal_id === malId);
  if (!exists) {
    return next(new AppError("History item not found", 404));
  }

  user.watchHistory = user.watchHistory.filter((h) => h.mal_id !== malId);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Removed from history",
    data: {
      history: user.watchHistory,
    },
  });
});

/**
 * Clear Watch History
 * DELETE /api/v1/users/history
 */
export const clearHistory = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.watchHistory = [];
  await user.save();

  res.status(200).json({
    status: "success",
    message: "History cleared",
  });
});
