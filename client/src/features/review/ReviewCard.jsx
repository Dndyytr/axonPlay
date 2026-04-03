import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  TrashIcon,
  PencilIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/solid";
import { deleteReview, markHelpful } from "../../store/reviewSlice";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";

const ReviewCard = ({ review, animeId, isOwnReview }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful?.length || 0);
  const [loading, setLoading] = useState(false);
  const liked = review.liked ?? false;
  const likes = review.likes ?? review.helpful?.length ?? 0;

  useEffect(() => {
    if (review.helpful) {
      // Count helpful users (handle both object and string IDs)
      const count = review.helpful.length;
      setHelpfulCount(count);

      // Check if current user has marked as helpful
      if (currentUser && currentUser._id) {
        const hasMarked = review.helpful.some((user) => {
          // Handle populated user object
          if (user && user._id) {
            return user._id === currentUser._id;
          }
          // Handle string ID (fallback)
          return user === currentUser._id;
        });
        setIsHelpful(hasMarked);
      }
    }
  }, [currentUser, review.helpful]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await dispatch(deleteReview(review._id)).unwrap();
      } catch (error) {
        alert(error || "Failed to delete review");
      }
    }
  };

  const handleHelpful = async () => {
    if (isOwnReview) {
      alert("You cannot mark your own review as helpful");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const result = await dispatch(markHelpful(review._id)).unwrap();
      // ✅ Pakai data dari server, bukan hitung manual
      setIsHelpful(result.isHelpful);
      setHelpfulCount(result.helpfulCount);
    } catch (error) {
      console.error("Failed to mark helpful:", error);
    } finally {
      setLoading(false); // ✅ selalu reset loading
    }
  };

  const handleLike = async () => {
    if (isOwnReview) return;
    if (loading) return;
    setLoading(true);
    try {
      await dispatch(markHelpful(review._id)).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isEditing) {
    return (
      <ReviewForm
        animeId={animeId}
        existingReview={review}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {review.user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>

          {/* User Info */}
          <div>
            <h4 className="text-white font-semibold">
              {review.user?.username || "Anonymous"}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{formatDate(review.createdAt)}</span>
              {review.isEdited && <span>• (edited)</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        {isOwnReview && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-white transition"
              title="Edit review"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 transition"
              title="Delete review"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {/* Comment */}
      <p className="text-gray-300 whitespace-pre-line mb-4">{review.comment}</p>

      {/* Helpful Button */}
      {!isOwnReview && (
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 text-sm transition ${
            liked ? "text-green-400" : "text-gray-400 hover:text-white"
          }`}
        >
          <HandThumbUpIcon className="w-4 h-4" />
          <span>
            {liked ? "Liked" : "Like"} ({likes})
          </span>
        </button>
      )}
    </div>
  );
};

export default ReviewCard;
