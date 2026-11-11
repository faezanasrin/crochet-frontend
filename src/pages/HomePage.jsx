import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import ProductGrid from "../components/ProductGrid";

export default function HomePage({
  products,
  loading,
  onAddToCart,
  favoriteIds,
  onToggleFavorite,
}) {
  return (
    <main>
      <HeroBanner products={products} />
      <section className="shop-section home-favorites">
        <div className="shop-section__heading">
          <div>
            <span className="eyebrow">A FEW CUSTOMER FAVORITES</span>
            <h2>Little things to love</h2>
            <p>Thoughtfully crocheted treasures, made stitch by stitch.</p>
          </div>
          <span className="shop-section__flower" aria-hidden="true">
            ✿
          </span>
        </div>
        <ProductGrid
          products={products.slice(0, 4)}
          loading={loading}
          onAddToCart={onAddToCart}
          selectedCategory="All"
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
        />
        {!loading && products.length > 0 && (
          <div className="home-favorites__action">
            <Link className="primary-button" to="/shop">
              Explore everything <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
