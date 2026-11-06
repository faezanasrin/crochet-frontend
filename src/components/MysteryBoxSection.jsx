import { Link } from "react-router-dom";
import { getProductImageUrl } from "../utils/productImage";

export default function MysteryBoxSection({ products = [] }) {
  const mysteryBox = products.find(
    (product) =>
      product.category?.trim().toLowerCase() === "mystery box" ||
      /mystery box/i.test(product.name || ""),
  );

  if (!mysteryBox) return null;

  const imageUrl = getProductImageUrl(mysteryBox);
  const productUrl = `/products/${encodeURIComponent(mysteryBox.id)}`;

  return (
    <section
      className="mystery-spotlight-wrapper"
      aria-labelledby="mystery-heading"
    >
      <div className="mystery-spotlight-card">
        <Link
          className="mystery-image-frame"
          to={productUrl}
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
          <span className="mystery-floating-tag">🎁 A little surprise</span>
        </Link>

        <div className="mystery-content-side">
          <span className="mystery-badge">✨ MYSTERY BOX</span>
          <h2 className="mystery-heading" id="mystery-heading">
            {mysteryBox.name}
          </h2>
          <p className="mystery-desc">
            A handmade surprise, thoughtfully crocheted and packed with care.
          </p>
          <div className="mystery-action-row">
            <div className="mystery-pricing">
              <span className="mystery-price">
                ₹{Number(mysteryBox.price).toFixed(2)}
              </span>
              <span
                className={`mystery-stock${
                  mysteryBox.inStock ? "" : " mystery-stock--unavailable"
                }`}
              >
                {mysteryBox.inStock ? "In stock" : "Out of stock"}
              </span>
            </div>
            <Link className="mystery-details-link" to={productUrl}>
              Discover more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
