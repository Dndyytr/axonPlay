import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { useState } from "react";

const StarRating = ({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = "md",
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition`}
        >
          {(hoverRating || rating) >= star ? (
            <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
          ) : (
            <StarOutline className={`${sizeClasses[size]} text-gray-500`} />
          )}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
