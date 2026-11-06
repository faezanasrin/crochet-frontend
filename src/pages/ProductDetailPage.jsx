import { useState } from "react";
import { Link } from "react-router-dom";
import ProductReviews from "../components/ProductReviews";

export default function ProductDetailPage({
  product,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  authToken,
  onOpenAuth,
}) {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const isMysteryBox = product.category?.toLowerCase() === "mystery box";

  const handleAdd = () => {
    // Add multiple quantities to cart
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  return (
    <div
      style={{
        maxWidth: "1050px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem",
        minHeight: "80vh",
      }}
    >
      {/* Breadcrumb Navigation */}
      <nav
        style={{ marginBottom: "2rem", fontSize: "0.9rem", color: "#8E736C" }}
      >
        <Link to="/" style={{ color: "#8E736C", textDecoration: "none" }}>
          Home
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link to="/shop" style={{ color: "#8E736C", textDecoration: "none" }}>
          Shop
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "#4A3E3D", fontWeight: "600" }}>
          {product.name}
        </span>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Product Image Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "28px",
            padding: "1.5rem",
            border: "1px solid #EFE5DF",
            boxShadow: "0 10px 30px rgba(180, 150, 160, 0.08)",
          }}
        >
          <div
            style={{
              height: "380px",
              borderRadius: "20px",
              backgroundColor: "#FAF4EF",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <span style={{ fontSize: "5rem" }}>🧸</span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1rem",
              padding: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "#8E736C" }}>
              🧶 100% Hand-crocheted
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                color: "#416E4D",
                fontWeight: "600",
                backgroundColor: "#EAF2EC",
                padding: "4px 10px",
                borderRadius: "8px",
              }}
            >
              🌿 Eco-friendly & Sustainable
            </span>
          </div>
        </div>

        {/* Right Column: Product Information & Purchase */}
        <div>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "700",
              backgroundColor: "#FCE7EE",
              color: "#8B3E54",
              padding: "4px 12px",
              borderRadius: "9999px",
              textTransform: "uppercase",
            }}
          >
            {product.category || "Crochet"}
          </span>

          <h1
            style={{
              margin: "0.8rem 0 0.5rem",
              color: "#3B2F2F",
              fontSize: "2.2rem",
            }}
          >
            {product.name}
          </h1>
          <button
            aria-pressed={isFavorite}
            aria-label={`${isFavorite ? "Remove" : "Save"} ${product.name} ${isFavorite ? "from" : "to"} saved treasures`}
            className={`product-detail__favorite${isFavorite ? " is-favorite" : ""}`}
            onClick={() => onToggleFavorite(product.id)}
            type="button"
          >
            <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
            {isFavorite ? "Saved to treasures" : "Save to treasures"}
          </button>

          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: "800",
              color: "#B85B74",
              marginBottom: "1.2rem",
            }}
          >
            ₹{Number(product.price).toFixed(2)}
          </div>
          {isMysteryBox && (
            <section className="mystery-box-details">
              <h2>🎁 What’s in Your Founder Box?</h2>
              <ul>
                <li>
                  <strong>1 Full-Sized Creation:</strong> Tulip stem, flower
                  pot, or daisy bag charm
                </li>
                <li>
                  <strong>1 Micro Surprise:</strong> Sprout headphone tie or
                  crochet hair clip
                </li>
                <li>
                  <strong>Numbered Founder Postcard:</strong> Handwritten card
                  (e.g., <em>“Founder #4 of 10”</em>)
                </li>
                <li>
                  <strong>VIP Perk:</strong> A private 15% discount card for
                  your next custom order
                </li>
                <li>
                  <strong>Cozy Packaging:</strong> Wrapped in pink tissue
                  paper, lace ribbon, and wax seal
                </li>
              </ul>
              <p>
                Each box is a surprise, thoughtfully packed by the founder.
              </p>
            </section>
          )}
          <p
            className={`product-detail__availability ${
              product.inStock
                ? "product-detail__availability--available"
                : "product-detail__availability--unavailable"
            }`}
            role="status"
          >
            {product.inStock ? "✓ In stock" : "Out of stock"}
          </p>

          <p
            style={{
              color: "#6A5C59",
              lineHeight: "1.6",
              fontSize: "0.95rem",
              margin: "0 0 1.5rem",
            }}
          >
            {isMysteryBox
              ? "A limited founder collection featuring a surprise handmade creation and thoughtful extra treats."
              : "Delicately crafted loop by loop using premium soft yarns. Ideal as a charming gift, desk companion, or keepsake that won't wilt or fray."}
          </p>

          {/* Key Craft Specifications */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              border: "1px solid #EFE5DF",
              padding: "1.2rem",
              marginBottom: "1.8rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#8E736C",
                  display: "block",
                }}
              >
                YARN MATERIAL
              </span>
              <strong style={{ fontSize: "0.9rem", color: "#4A3E3D" }}>
                {product.yarnType || "Milk Cotton Yarn"}
              </strong>
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#8E736C",
                  display: "block",
                }}
              >
                MAKING TIME
              </span>
              <strong style={{ fontSize: "0.9rem", color: "#4A3E3D" }}>
                2–4 business days
              </strong>
            </div>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #D8C7BF",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "#6A3845",
                }}
              >
                -
              </button>
              <span
                style={{
                  minWidth: "32px",
                  textAlign: "center",
                  fontWeight: "700",
                  color: "#3B2F2F",
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "#6A3845",
                }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              style={{
                flex: 1,
                backgroundColor: !product.inStock
                  ? "#B8A99B"
                  : addedAnimation
                    ? "#416E4D"
                    : "#8B3E54",
                color: "#FFFFFF",
                border: "none",
                padding: "13px 20px",
                borderRadius: "14px",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: product.inStock ? "pointer" : "not-allowed",
                transition: "background-color 0.2s ease",
              }}
            >
              {!product.inStock
                ? "Out of Stock"
                : addedAnimation
                ? "✓ Added to Basket!"
                : `Add to Basket • ₹${(product.price * quantity).toFixed(2)}`}
            </button>
          </div>

          {/* Care Instructions Accordion Card */}
          <div
            style={{
              backgroundColor: "#FDFBF7",
              borderRadius: "18px",
              border: "1px solid #F0E6E0",
              padding: "1.2rem",
            }}
          >
            <h4
              style={{
                margin: "0 0 0.8rem",
                color: "#6A3845",
                fontSize: "0.95rem",
              }}
            >
              🌸 Crochet Care & Washing Tips
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2rem",
                color: "#6A5C59",
                fontSize: "0.85rem",
                lineHeight: "1.6",
              }}
            >
              <li>
                Hand wash gently in cold water using a mild shampoo or
                detergent.
              </li>
              <li>
                Do not wring or twist; gently press between a dry towel to
                remove moisture.
              </li>
              <li>
                Lay flat to air dry in the shade to maintain shape and stitch
                tension.
              </li>
            </ul>
          </div>
        </div>
        <ProductReviews
          productId={product.id}
          authToken={authToken}
          onOpenAuth={onOpenAuth}
        />
      </div>
    </div>
  );
}
