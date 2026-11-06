import { Link } from "react-router-dom";
import { getProductImageUrl } from "../utils/productImage";
import "./HeroBanner.css";

function ProductPolaroid({ product, variant = "main" }) {
  const imageUrl = getProductImageUrl(product);

  return (
    <Link
      className={`hero-polaroid hero-polaroid--${variant}`}
      to={`/products/${encodeURIComponent(product.id)}`}
      aria-label={`View ${product.name}`}
    >
      <div className="hero-polaroid__image-wrap">
        <span className="hero-polaroid__placeholder" aria-hidden="true">
          🌸
        </span>
        {imageUrl && (
          <img
            alt={product.name}
            className="hero-polaroid__image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            src={imageUrl}
          />
        )}
        {variant === "main" && (
          <span className="hero-polaroid__tape" aria-hidden="true" />
        )}
      </div>
      <div className="hero-polaroid__caption">
        <strong>{product.name}</strong>
        <span>
          {product.yarnType || product.category || "Handmade with love"}
        </span>
      </div>
    </Link>
  );
}

export default function HeroBanner({ products = [] }) {
  const mysteryBox = products.find(
    (product) => product.category?.toLowerCase() === "mystery box",
  );
  const floralProducts = products.filter((product) =>
    /flower|tulip|bouquet|daisy/i.test(
      `${product.name} ${product.category || ""}`,
    ),
  );
  const featuredProducts = [
    ...(mysteryBox ? [mysteryBox] : []),
    ...floralProducts,
    ...products.filter(
      (product) =>
        product !== mysteryBox && !floralProducts.includes(product),
    ),
  ].slice(0, 2);

  return (
    <>
      <section className="cute-hero">
        <span className="cute-hero__decoration cute-hero__decoration--one" aria-hidden="true">
          ✿
        </span>
        <span className="cute-hero__decoration cute-hero__decoration--two" aria-hidden="true">
          ❀
        </span>
        <div className="cute-hero__container">
          <div className="cute-hero__content">
            <span className="cute-hero__badge">
              <span aria-hidden="true">🧶</span>
              Little things, made slowly with love
              <span aria-hidden="true">🌸</span>
            </span>
            <h1 className="cute-hero__headline">
              Little loops,
              <br />
              <span className="cute-hero__highlight">lasting love.</span>
            </h1>
            <p className="cute-hero__subtext">
              Thoughtfully crocheted treasures, from everlasting flowers to
              keepsakes made to brighten someone’s day.
            </p>
            <div className="cute-hero__actions">
              <Link className="cute-hero__primary-btn" to="/shop">
                Explore the collection <span aria-hidden="true">→</span>
              </Link>
              {mysteryBox && (
                <Link
                  className="cute-hero__mystery-btn"
                  to={`/products/${encodeURIComponent(mysteryBox.id)}`}
                >
                  🎁 Claim 1 of 10 Founder Mystery Boxes →
                </Link>
              )}
              <a className="cute-hero__contact-btn" href="/#contact-title">
                <span aria-hidden="true">♡</span> Ask about a custom order
              </a>
            </div>
            <div className="cute-hero__trust">
              <span aria-hidden="true">✿</span>
              <p>Small-batch crochet, thoughtfully made by hand.</p>
            </div>
          </div>

          <div className="cute-hero__visuals" aria-label="Featured crochet pieces">
            <div className="hero-showcase">
              <span className="hero-showcase__halo" aria-hidden="true" />
              {featuredProducts.length ? (
                featuredProducts.map((product, index) => (
                  <ProductPolaroid
                    key={product.id}
                    product={product}
                    variant={index === 0 ? "main" : "secondary"}
                  />
                ))
              ) : (
                <div className="hero-showcase__empty" aria-hidden="true">
                  <span>🧶</span>
                  <strong>Made stitch by stitch</strong>
                  <small>A little handmade happiness</small>
                </div>
              )}
              <span className="hero-showcase__sticker hero-showcase__sticker--craft">
                <span aria-hidden="true">🧵</span>
                <span>
                  <strong>Hook &amp; heart</strong>
                  <small>Made by hand</small>
                </span>
              </span>
              <span className="hero-showcase__sticker hero-showcase__sticker--flower" aria-hidden="true">
                🌷 A little joy
              </span>
            </div>
          </div>
        </div>
        <div className="cute-hero__scallop" aria-hidden="true" />
      </section>

      <section className="perks" aria-label="Shopping benefits">
        <div className="perk">
          <span aria-hidden="true">🧵</span>
          <div>
            <strong>Made by hand</strong>
            <small>Every piece is one of a kind</small>
          </div>
        </div>
        <div className="perk">
          <span aria-hidden="true">🌿</span>
          <div>
            <strong>Made with care</strong>
            <small>Soft yarn, thoughtful details</small>
          </div>
        </div>
        <div className="perk">
          <span aria-hidden="true">🎁</span>
          <div>
            <strong>Ready to gift</strong>
            <small>A little joy in every parcel</small>
          </div>
        </div>
      </section>
    </>
  );
}
