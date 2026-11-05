import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  loading,
  onAddToCart,
  selectedCategory,
  favoriteIds,
  onToggleFavorite,
}) {
  if (loading) {
    return (
      <div className="shop-message" role="status">
        <span aria-hidden="true">🧶</span>
        <p>Knitting the shelves together...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="shop-message">
        <span aria-hidden="true">🌷</span>
        <p>
          {selectedCategory === "All"
            ? "No little treasures just yet. Please check back soon!"
            : `No ${selectedCategory.toLowerCase()} just yet. Please check back soon!`}
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isFavorite={favoriteIds?.includes(String(product.id)) ?? false}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
