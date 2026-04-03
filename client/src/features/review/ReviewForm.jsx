import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createReview, updateReview } from "../../store/reviewSlice";
import StarRating from "./StarRating";
import { XMarkIcon } from "@heroicons/react/24/solid";

const ReviewForm = ({ animeId, existingReview, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.review);

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5");
      return;
    }

    if (comment.length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    try {
      if (existingReview) {
        await dispatch(
          updateReview({ id: existingReview._id, rating, comment }),
        ).unwrap();
      } else {
        await dispatch(
          createReview({ animeMalId: animeId, rating, comment }),
        ).unwrap();
      }

      onClose?.();
    } catch (err) {
      setError(err || "Failed to submit review");
    }
  };

  return (
    <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-gray-300 mb-2">Your Rating</label>
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          <p className="text-gray-500 text-sm mt-1">
            {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-gray-300 mb-2">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this anime..."
            rows={5}
            className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white 
              focus:outline-none focus:border-primary transition resize-none"
            maxLength={1000}
          />
          <p className="text-gray-500 text-sm mt-1 text-right">
            {comment.length}/1000 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary py-3 rounded text-white font-semibold 
            hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading
            ? "Submitting..."
            : existingReview
              ? "Update Review"
              : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
