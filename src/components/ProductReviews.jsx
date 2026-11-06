import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/api";

const API_URL = `${API_BASE_URL}/api/products`;

function renderStars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function ProductReviews({
  productId,
  authToken,
  onOpenAuth,
  formOnly = false,
}) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasReviewed: false,
  });
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadReviews = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch(`${API_URL}/${productId}/reviews`, {
          signal: controller.signal,
        });
        if (response.status === 404) {
          throw new Error(
            "The review API is not available in the running backend. Restart the Spring Boot server to load the latest changes.",
          );
        }
        if (!response.ok) {
          throw new Error(`Reviews could not be loaded (HTTP ${response.status}).`);
        }
        const result = await response.json();
        setReviews(result.reviews);
        setAverageRating(result.averageRating);
        setReviewCount(result.reviewCount);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorMessage(
            error instanceof TypeError
              ? "Could not reach the review API. Check that the Spring Boot backend is running."
              : error.message || "Reviews could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadReviews();
    return () => controller.abort();
  }, [productId]);

  useEffect(() => {
    let isCurrent = true;
    const loadEligibility = async () => {
      setEligibility({ canReview: false, hasReviewed: false });
      if (!authToken) return;
      try {
        const response = await fetch(
          `${API_URL}/${productId}/reviews/eligibility`,
          { headers: { Authorization: `Bearer ${authToken}` } },
        );
        if (!response.ok) throw new Error("Review eligibility could not be checked.");
        const result = await response.json();
        if (isCurrent) setEligibility(result);
      } catch (error) {
        if (isCurrent) setErrorMessage(error.message);
      }
    };

    loadEligibility();
    return () => {
      isCurrent = false;
    };
  }, [productId, authToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch(`${API_URL}/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ rating: selectedRating, comment }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Your review could not be submitted.");
      }
      const updatedReviews = [result, ...reviews];
      setReviews(updatedReviews);
      setReviewCount(updatedReviews.length);
      setAverageRating(
        updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
          updatedReviews.length,
      );
      setEligibility({ canReview: false, hasReviewed: true });
      setComment("");
      setSuccessMessage("Thank you for sharing your thoughts!");
    } catch (error) {
      setErrorMessage(error.message || "Your review could not be submitted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`product-reviews${formOnly ? " product-reviews--form-only" : ""}`}>
      {!formOnly && (
        <>
          <div className="product-reviews__heading">
            <div>
              <span className="eyebrow">KIND WORDS</span>
              <h2 id="product-reviews-title">Customer reviews</h2>
            </div>
            <div className="product-reviews__summary" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
              <span aria-hidden="true">{renderStars(Math.round(averageRating))}</span>
              <strong>{averageRating.toFixed(1)}</strong>
              <span>({reviewCount})</span>
            </div>
          </div>

          {isLoading ? (
            <p className="product-reviews__notice" role="status">Loading reviews...</p>
          ) : reviews.length ? (
            <div
              aria-label="Customer reviews"
              className="product-reviews__list"
              tabIndex={0}
            >
              {reviews.map((review) => (
                <article className="product-review" key={review.id}>
                  <div className="product-review__meta">
                    <strong>{review.reviewerName}</strong>
                    <span aria-label={`${review.rating} out of 5 stars`}>
                      {renderStars(review.rating)}
                    </span>
                    <time dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}
                    </time>
                  </div>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="product-reviews__notice">
              No reviews yet. Your kind words could be the first.
            </p>
          )}
        </>
      )}

      <div className="product-reviews__form-wrap">
        {!formOnly && <h3>Share your experience</h3>}
        {formOnly && <h4>Review this item</h4>}
        {!authToken ? (
          <p>
            <button className="product-reviews__text-button" onClick={onOpenAuth} type="button">
              Sign in
            </button>{" "}
            to leave a review after your order is delivered.
          </p>
        ) : eligibility.hasReviewed ? (
          <p className="product-reviews__notice">Thank you — you have reviewed this treasure.</p>
        ) : eligibility.canReview ? (
          <form className="product-review-form" onSubmit={handleSubmit}>
            <fieldset className="product-review-form__rating">
              <legend>Your rating</legend>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
                  aria-pressed={selectedRating === rating}
                  className={rating <= selectedRating ? "is-selected" : ""}
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  type="button"
                >
                  ★
                </button>
              ))}
            </fieldset>
            <label>
              <span>Your review</span>
              <textarea
                maxLength={1000}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What did you love about this piece?"
                required
                rows={4}
                value={comment}
              />
            </label>
            <div className="product-review-form__footer">
              <span>{comment.length}/1000</span>
              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Submitting..." : "Post review"}
              </button>
            </div>
          </form>
        ) : (
          <p className="product-reviews__notice">
            Verified customers can review after their order for this item is delivered.
          </p>
        )}
        {errorMessage && <p className="product-reviews__error" role="alert">{errorMessage}</p>}
        {successMessage && <p className="product-reviews__success" role="status">{successMessage}</p>}
      </div>
    </section>
  );
}
