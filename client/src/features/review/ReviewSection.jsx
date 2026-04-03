import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAnimeReviews } from "../../store/reviewSlice";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import { StarIcon } from "@heroicons/react/24/solid";

const ReviewSection = ({ animeId }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { reviews, averageRating, totalReviews, loading, userReview } =
    useSelector((state) => state.review);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchAnimeReviews({ animeId, page: 1, limit: 10 }));
  }, [dispatch, animeId]);

  const userId = user?._id;

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Reviews ({totalReviews})
          </h2>
          {averageRating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-semibold text-white">
                {averageRating}
              </span>
              <span className="text-gray-400">/ 5</span>
            </div>
          )}
        </div>

        {!userReview && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary px-6 py-2 rounded text-white font-semibold 
              hover:bg-red-700 transition"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>
      {/* Review Form */}
      {showForm && !userReview && (
        <div className="mb-8">
          <ReviewForm animeId={animeId} onClose={() => setShowForm(false)} />
        </div>
      )}
      // ✅ Hanya tampil kalau user punya review dan tidak sedang edit
      {userReview && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="text-primary hover:underline text-sm mb-4"
        >
          Edit Your Review
        </button>
      )}
      {/* User's Existing Review */}
      {userReview && showForm && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Your Review</h3>
          </div>
          <ReviewCard
            review={userReview}
            animeId={animeId}
            isOwnReview={true}
          />
        </div>
      )}
      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading reviews...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews
            .filter((r) => r._id !== userReview?._id) // Exclude user's own review from list
            .map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                animeId={animeId}
                isOwnReview={userId && review.user._id === userId}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
