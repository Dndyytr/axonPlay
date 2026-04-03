import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    console.log("📥 Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.message);

    const status = error.response?.status;
    const url = error.config?.url || "";

    // ✅ 429 bukan alasan logout — hanya log warning
    if (status === 429) {
      console.warn("⚠️ Rate limited:", url);
      return Promise.reject(error); // ← langsung reject, jangan logout
    }

    if (error.response?.status === 401) {
      const url = error.config?.url || "";

      // ✅ Hanya logout kalau memang endpoint auth yang reject
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/me");

      // ✅ Jangan logout kalau lagi hit /auth/me (getMe check)
      if (!url.includes("/auth/me")) {
        // ✅ Cek dulu apakah token memang tidak ada
        const token = localStorage.getItem("token");
        if (!token) {
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else if (isAuthEndpoint) {
          // Token ada tapi rejected oleh auth endpoint = expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        // Kalau bukan auth endpoint → jangan logout, biarkan error propagate
      }
    }

    if (error.code === "ERR_NETWORK") {
      console.error("Network Error - Check if server is running!");
    }

    return Promise.reject(error);
  },
);

export const healthAPI = {
  check: () => api.get("/health"),
};

// Auth API endpoints
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.patch("/auth/update-profile", data),
  changePassword: (data) => api.patch("/auth/change-password", data),
  deleteAccount: (data) => api.delete("/auth/delete-account", { data }),
  logout: () => api.post("/auth/logout"),
};

// Add user API endpoints
export const userAPI = {
  addToWatchlist: (data) => api.post("/users/watchlist", data),
  removeFromWatchlist: (id) => api.delete(`/users/watchlist/${id}`),
  getWatchlist: () => api.get("/users/watchlist"),
  getHistory: () => api.get("/users/history"),
  updateHistory: (data) => api.patch("/users/history", data),
  clearHistory: () => api.delete("/users/history"),
  removeFromHistory: (id) => api.delete(`/users/history/${id}`),
};

// Add anime API endpoints
export const animeAPI = {
  // Anime endpoints
  getTop: (params) => api.get("/anime", { params }),
  getById: (id) => api.get(`/anime/${id}`),
  getEpisodes: (id, params) => api.get(`/anime/${id}/episodes`, { params }),
  search: (query, params) =>
    api.get("/anime/search", { params: { q: query, ...params } }),
  getSeasonal: (year, season) => api.get(`/anime/season/${year}/${season}`),
  getRandom: () => api.get("/anime/random"),
};

// Add Review API
export const reviewAPI = {
  getAnimeReviews: (animeId, params) =>
    api.get(`/reviews/anime/${animeId}`, { params }),
  createReview: (data) => api.post("/reviews", data),
  updateReview: (id, data) => api.patch(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getMyReviews: (params) => api.get("/reviews/my-reviews", { params }),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  search: (query, params) =>
    api.get("/anime/search", { params: { q: query, ...params } }),
};

// Admin API endpoints
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, data) => api.patch(`/admin/users/${id}/role`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
