import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-dark/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-primary text-2xl font-bold">
            AniStream
          </Link>

          {/* Search Bar in Navbar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search anime..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    navigate(
                      `/search?q=${encodeURIComponent(e.target.value.trim())}`,
                    );
                    e.target.value = "";
                  }
                }}
                className="w-full px-4 py-2 bg-dark-gray border border-gray-700 rounded-lg 
                  text-white placeholder-gray-500 focus:outline-none focus:border-primary 
                  focus:ring-1 focus:ring-primary transition"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition">
              Home
            </Link>
            <Link
              to="/browse"
              className="text-gray-300 hover:text-white transition"
            >
              Browse
            </Link>
            {isAuthenticated && (
              <Link
                to="/watchlist"
                className="text-gray-300 hover:text-white transition"
              >
                My List
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                className="text-gray-300 hover:text-white transition"
              >
                Profile
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-300 hidden md:block">
                  Hi, {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-primary px-4 py-2 rounded text-white font-semibold hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary px-4 py-2 rounded text-white font-semibold hover:bg-red-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
