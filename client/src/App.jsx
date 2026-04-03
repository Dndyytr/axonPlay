import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import HomePage from "./pages/HomePage.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AnimeDetailPage from "./pages/AnimeDetailPage.jsx";
import WatchPage from "./pages/WatchPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import { useEffect } from "react";
import { getMe } from "./store/authSlice.js";
import SearchPage from "./pages/SearchPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // App.jsx atau main entry — tambah ini
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated) {
      dispatch(getMe()); // validate token
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen bg-dark">
      <Routes>
        {/* Public Routes (no navbar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        {/* Public Anime Detail Route (can be viewed without login) */}
        <Route path="/anime/:id" element={<AnimeDetailPage />} />

        {/* Protected Watch Route */}
        <Route
          path="/watch/:id"
          element={
            <ProtectedRoute>
              <WatchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Protected Routes (with navbar) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="pt-16">
                  <HomePage />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
