import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";

const SearchBar = ({ initialValue = "", placeholder = "Search anime..." }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(
    initialValue || searchParams.get("q") || "",
  );
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    navigate("/search");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div
        className={`flex items-center bg-dark-gray border rounded-lg overflow-hidden transition ${
          isFocused ? "border-primary ring-1 ring-primary" : "border-gray-700"
        }`}
      >
        {/* Search Icon */}
        <div className="pl-4 text-gray-400">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-500 
            focus:outline-none"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-4 text-gray-400 hover:text-white transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white font-semibold 
            hover:bg-red-700 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
