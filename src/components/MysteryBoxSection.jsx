import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../utils/productImage";

export default function MysteryBoxSection({ products = [], onAddToCart }) {
  const [isAdded, setIsAdded] = useState(false);
  const feedbackTimer = useRef(null);
  const mysteryBox = products.find(
    (product) =>
      product.category?.trim().toLowerCase() === "mystery box" ||
      /mystery box/i.test(product.name || ""),
  );

  useEffect(
    () => () => {
      window.clearTimeout(feedbackTimer.current);
    },
    [],
  );

  if (!mysteryBox) return null;

  const imageUrl = getProductImageUrl(mysteryBox);
  const handleAddToCart = () => {
    if (!mysteryBox.inStock) return;

    onAddToCart(mysteryBox);
    setIsAdded(true);
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <section className="mystery-spotlight-wrapper" aria-labelledby="mystery-heading">
      <div className="mystery-spotlight-card">
        <div className="mystery-visual-side">
          <Link
            className="mystery-image-frame"
            to={`/products/${encodeURIComponent(mysteryBox.id)}`}
            aria-label={`View ${mysteryBox.name}`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={mysteryBox.name}
                className="mystery-box-img"
              />
            ) : (
              <span className="mystery-image-placeholder" aria-hidden="true">
                🎁
              </span>
            )}
            <span className="mystery-floating-tag">🎁 A founder favorite</span>
          </Link>
          <p
            className={`mystery-countdown-pill ${
              mysteryBox.inStock ? "" : "mystery-countdown-pill--unavailable"
            }`}
          >
            <span className="pulsing-dot" aria-hidden="true" />
            {mysteryBox.inStock ? "In stock and ready to surprise" : "Out of stock"}
          </p>
        </div>

        <div className="mystery-content-side">
          <span className="mystery-badge">✨ FOUNDER'S MYSTERY BOX</span>
          <h2 className="mystery-heading" id="mystery-heading">
            {mysteryBox.name}
          </h2>
          <p className="mystery-desc">
            A surprise parcel of handmade crochet keepsakes, thoughtfully
            stitched and packed with care.
          </p>

          <div className="mystery-perks-box">
            <h3>📦 A little of what to expect</h3>
            <ul>
              <li>
                <span aria-hidden="true">🌸</span>
                <span>
                  <strong>A full-sized keepsake:</strong> a surprise flower,
                  desk buddy, or mini planter.
                </span>
              </li>
              <li>
                <span aria-hidden="true">🍓</span>
                <span>
                  <strong>A handmade extra:</strong> a cute cord wrap, sprout
                  tie, or floral clip.
                </span>
              </li>
              <li>
                <span aria-hidden="true">💌</span>
                <span>
                  <strong>A founder postcard:</strong> a handwritten note from
                  the studio.
                </span>
              </li>
              <li>
                <span aria-hidden="true">🎀</span>
                <span>
                  <strong>Gift-ready packaging:</strong> wrapped with care and
                  finished with a little flourish.
                </span>
              </li>
            </ul>
          </div>

          <div className="mystery-action-row">
            <div className="mystery-pricing">
              <span className="mystery-price">
                ₹{Number(mysteryBox.price).toFixed(2)}
              </span>
              {mysteryBox.yarnType && (
                <span className="mystery-yarn-type">{mysteryBox.yarnType}</span>
              )}
            </div>
            <button
              type="button"
              className={`mystery-claim-btn${isAdded ? " claimed" : ""}`}
              onClick={handleAddToCart}
              disabled={!mysteryBox.inStock}
            >
              {!mysteryBox.inStock
                ? "Out of stock"
                : isAdded
                  ? "✓ Added to bag!"
                  : "Add mystery box to bag →"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
