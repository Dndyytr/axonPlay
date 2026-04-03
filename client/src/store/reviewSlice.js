import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reviewAPI } from "../services/api";

// Async thunks
export const fetchAnimeReviews = createAsyncThunk(
  "review/fetchAnimeReviews",
  async ({ animeId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.getAnimeReviews(animeId, {
        page,
        limit,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reviews",
      );
    }
  },
);

export const createReview = createAsyncThunk(
  "review/createReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.createReview(reviewData);
      return response.data.data.review;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create review",
      );
    }
  },
);

export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete review",
      );
    }
  },
);

export const updateReview = createAsyncThunk(
  "review/updateReview",
  async ({ id, ...reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.updateReview(id, reviewData);
      return response.data.data.review;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update review",
      );
    }
  },
);

export const markHelpful = createAsyncThunk(
  "review/markHelpful",
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.markHelpful(reviewId);
      return {
        reviewId,
        liked: response.data.data.liked,
        likes: response.data.data.likes,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed");
    }
  },
);

const initialState = {
  reviews: [],
  averageRating: 0,
  totalReviews: 0,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  loading: false,
  error: null,
  userReview: null, // User's own review for the current anime
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserReview: (state, action) => {
      state.userReview = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reviews
      .addCase(fetchAnimeReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnimeReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.totalReviews = action.payload.totalReviews;
        state.averageRating = action.payload.averageRating;
        state.pagination = action.payload.pagination;

        // ✅ Ambil userId dari localStorage
        const userId = JSON.parse(localStorage.getItem("user"))?._id;

        // ✅ Inisialisasi liked dan likes untuk setiap review
        state.reviews = action.payload.reviews.map((review) => ({
          ...review,
          likes: review.helpful?.length ?? 0,
          liked: userId
            ? (review.helpful?.some((u) => {
                const uid = u?._id ?? u;
                return uid?.toString() === userId?.toString();
              }) ?? false)
            : false,
        }));

        // Find user's own review
        if (userId) {
          state.userReview =
            action.payload.reviews.find((r) => r.user._id === userId) || null;
        }
      })
      .addCase(fetchAnimeReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.totalReviews += 1;
        state.userReview = action.payload;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
        state.totalReviews -= 1;
        state.userReview = null;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        state.userReview = action.payload;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark Helpful
      .addCase(markHelpful.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markHelpful.fulfilled, (state, action) => {
        state.loading = false;
        const { reviewId, liked, likes } = action.payload;
        const review = state.reviews.find((r) => r._id === reviewId);
        if (review) {
          review.liked = liked; // update status like user ini
          review.likes = likes; // update total likes
        }
      })
      .addCase(markHelpful.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUserReview } = reviewSlice.actions;
export default reviewSlice.reducer;
