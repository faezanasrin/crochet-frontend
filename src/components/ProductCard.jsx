import { Link } from "react-router-dom";
import { getProductImageUrl } from "../utils/productImage";

export default function ProductCard({
  product,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) {
  const imageUrl = getProductImageUrl(product);
  const isMysteryBox = product.category?.toLowerCase() === "mystery box";

  return (
    <article className="product-card">
      <Link
        className="product-card__link"
        to={`/products/${encodeURIComponent(product.id)}`}
        aria-label={`View ${product.name}`}
      >
        <div className="product-card__image">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} />
          ) : (
            <span className="product-card__placeholder" aria-hidden="true">
              🧸
            </span>
          )}
          {isMysteryBox ? (
            <span className="product-card__limited-badge">
              ✨ LIMITED EDITION · 10 ONLY
            </span>
          ) : (
            <span className="product-card__tag">
              {product.category || "Handmade"}
            </span>
          )}
          {!product.inStock && (
            <span className="product-card__stock-tag">Out of stock</span>
          )}
        </div>
      </Link>
      <button
        aria-label={`${isFavorite ? "Remove" : "Save"} ${product.name} ${isFavorite ? "from" : "to"} saved treasures`}
        aria-pressed={isFavorite}
        className={`product-card__heart${isFavorite ? " is-favorite" : ""}`}
        onClick={() => onToggleFavorite(product.id)}
        type="button"
      >
        {isFavorite ? "♥" : "♡"}
      </button>
      <div className="product-card__details">
        <div>
          <p className="product-card__kicker">
            {product.yarnType || "Made with love"}
          </p>
          <p
            className={`product-card__availability ${
              product.inStock
                ? "product-card__availability--available"
                : "product-card__availability--unavailable"
            }`}
          >
            {product.inStock ? "In stock" : "Out of stock"}
          </p>
          <h3>
            <Link
              className="product-card__title-link"
              to={`/products/${encodeURIComponent(product.id)}`}
            >
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="product-card__bottom">
          <span className="product-card__price">
            ₹{Number(product.price).toFixed(2)}
          </span>
          <button
            className="add-button"
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to basket`}
          >
            {product.inStock ? (
              <><span aria-hidden="true">+</span> Add to basket</>
            ) : "Out of stock"}
          </button>
        </div>
      </div>
    </article>
  );
}
