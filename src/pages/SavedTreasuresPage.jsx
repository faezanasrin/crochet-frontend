import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";

export default function SavedTreasuresPage({
  products,
  loading,
  favoriteIds,
  onToggleFavorite,
  onAddToCart,
}) {
  const savedProducts = products.filter((product) =>
    favoriteIds.some((id) => String(id) === String(product.id)),
  );

  return (
    <main className="saved-page">
      <section className="saved-page__intro">
        <span className="eyebrow-pill">♥ Your little collection</span>
        <h1>Saved Treasures</h1>
        <p>All the handmade pieces you have your eye on, gathered in one place.</p>
      </section>

      <section className="shop-section saved-page__products">
        {loading || savedProducts.length > 0 ? (
          <ProductGrid
            products={savedProducts}
            loading={loading}
            onAddToCart={onAddToCart}
            selectedCategory="All"
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          <div className="saved-page__empty">
            <span aria-hidden="true">♡</span>
            <h2>No treasures saved just yet</h2>
            <p>Tap the heart on anything you love and it will be waiting here.</p>
            <Link className="primary-button" to="/shop">
              Explore the shop <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
