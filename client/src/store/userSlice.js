import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../services/api";

// Async thunks
export const fetchWatchlist = createAsyncThunk(
  "user/fetchWatchlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getWatchlist();
      return response.data.data.watchlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch watchlist",
      );
    }
  },
);

export const fetchHistory = createAsyncThunk(
  "user/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getHistory();
      return response.data.data.history;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch history",
      );
    }
  },
);

export const addWatchlistItem = createAsyncThunk(
  "user/addWatchlist",
  async (item, { rejectWithValue }) => {
    try {
      const response = await userAPI.addToWatchlist(item);
      return response.data.data.watchlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to watchlist",
      );
    }
  },
);

export const removeWatchlistItem = createAsyncThunk(
  "user/removeWatchlist",
  async (mal_id, { rejectWithValue }) => {
    try {
      const response = await userAPI.removeFromWatchlist(mal_id);
      return response.data.data.watchlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from watchlist",
      );
    }
  },
);

export const updateWatchHistory = createAsyncThunk(
  "user/updateHistory",
  async (historyData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateHistory(historyData);
      return response.data.data.history;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update history",
      );
    }
  },
);

export const removeFromHistory = createAsyncThunk(
  "user/removeFromHistory",
  async (mal_id, { rejectWithValue }) => {
    try {
      const response = await userAPI.removeFromHistory(mal_id);
      return response.data.data.history;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from history",
      );
    }
  },
);

export const clearHistoryAsync = createAsyncThunk(
  "user/clearHistory",
  async (_, { rejectWithValue }) => {
    try {
      await userAPI.clearHistory();
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed");
    }
  },
);

const initialState = {
  watchlist: JSON.parse(localStorage.getItem("watchlist")) || [],
  watchHistory: JSON.parse(localStorage.getItem("watchHistory")) || [],
  watchlistLoading: false, // ✅ pisah
  historyLoading: false, // ✅ pisah
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setWatchlistLocal: (state, action) => {
      state.watchlist = action.payload;
      localStorage.setItem("watchlist", JSON.stringify(action.payload));
    },
    addToWatchlist: (state, action) => {
      const exists = state.watchlist.some(
        (item) => item.mal_id === action.payload.mal_id,
      );
      if (!exists) {
        state.watchlist.push(action.payload);
        localStorage.setItem("watchlist", JSON.stringify(state.watchlist));
      }
    },
    removeFromWatchlist: (state, action) => {
      state.watchlist = state.watchlist.filter(
        (item) => item.mal_id !== action.payload,
      );
      localStorage.setItem("watchlist", JSON.stringify(state.watchlist));
    },
    setWatchlist: (state, action) => {
      state.watchlist = action.payload;
      localStorage.setItem("watchlist", JSON.stringify(action.payload));
    },
    clearWatchlist: (state) => {
      state.watchlist = [];
      localStorage.removeItem("watchlist");
    },

    addToHistoryLocal: (state, action) => {
      const { mal_id, title, image, episodeNumber, progress, duration } =
        action.payload;
      const existingIndex = state.watchHistory.findIndex(
        (h) => h.mal_id === mal_id,
      );

      if (existingIndex !== -1) {
        state.watchHistory[existingIndex] = {
          ...state.watchHistory[existingIndex],
          episodeNumber,
          progress,
          duration,
          lastWatched: new Date().toISOString(),
        };
        // Move to top
        const item = state.watchHistory.splice(existingIndex, 1)[0];
        state.watchHistory.unshift(item);
      } else {
        state.watchHistory.unshift({
          mal_id,
          title,
          image,
          episodeNumber,
          progress,
          duration,
          lastWatched: new Date().toISOString(),
        });
      }

      if (state.watchHistory.length > 50) {
        state.watchHistory = state.watchHistory.slice(0, 50);
      }

      localStorage.setItem("watchHistory", JSON.stringify(state.watchHistory));
    },
    clearHistory: (state) => {
      state.watchHistory = [];
      localStorage.removeItem("watchHistory");
    },

    // removeFromHistory: (state, action) => {
    //   state.watchHistory = state.watchHistory.filter(
    //     (item) => item.mal_id !== action.payload,
    //   );
    //   localStorage.setItem("watchHistory", JSON.stringify(state.watchHistory));
    // },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlist = action.payload;
        localStorage.setItem("watchlist", JSON.stringify(action.payload));
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Watchlist
      .addCase(addWatchlistItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWatchlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlist = action.payload;
        localStorage.setItem("watchlist", JSON.stringify(action.payload));
      })
      .addCase(addWatchlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from Watchlist
      .addCase(removeWatchlistItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWatchlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlist = action.payload;
        localStorage.setItem("watchlist", JSON.stringify(action.payload));
      })
      .addCase(removeWatchlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch History
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.watchHistory = action.payload;
        localStorage.setItem("watchHistory", JSON.stringify(action.payload));
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update History
      .addCase(updateWatchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWatchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.watchHistory = action.payload;
        localStorage.setItem("watchHistory", JSON.stringify(action.payload));
      })
      .addCase(updateWatchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from History
      .addCase(removeFromHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.watchHistory = action.payload;
        localStorage.setItem("watchHistory", JSON.stringify(action.payload));
      })
      .addCase(removeFromHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear History
      .addCase(clearHistoryAsync.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(clearHistoryAsync.fulfilled, (state) => {
        state.historyLoading = false;
        state.watchHistory = []; // ✅ clear local state
        localStorage.removeItem("watchHistory"); // ✅ clear localStorage
      })
      .addCase(clearHistoryAsync.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addToWatchlist,
  removeFromWatchlist,
  setWatchlist,
  clearWatchlist,
  addToHistoryLocal,
  clearHistory,
  clearError,
  setWatchlistLocal,
} = userSlice.actions;
export default userSlice.reducer;
