import { useMemo, useState } from "react";
import ProductGrid from "../components/ProductGrid";

const CATEGORIES = [
  { id: "All", label: "Everything", icon: "✨" },
  { id: "Mystery Box", label: "Mystery Box 🎁", icon: "🎁" },
  { id: "Bookmarks", label: "Bookmarks", icon: "📚" },
  { id: "Flowers", label: "Flowers", icon: "🌸" },
  { id: "Bouquets", label: "Bouquets", icon: "💐" },
  { id: "Keychains", label: "Keychains", icon: "🧸" },
];

export default function ShopPage({
  products,
  loading,
  onAddToCart,
  favoriteIds,
  onToggleFavorite,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "All" ||
          product.category?.toLowerCase() === selectedCategory.toLowerCase();

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          product.name?.toLowerCase().includes(query) ||
          product.yarnType?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      })
      .sort((first, second) => {
        const firstIsMysteryBox =
          first.category?.toLowerCase() === "mystery box";
        const secondIsMysteryBox =
          second.category?.toLowerCase() === "mystery box";
        return Number(secondIsMysteryBox) - Number(firstIsMysteryBox);
      });
  }, [products, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const knownCategories = new Set(
      CATEGORIES.map((category) => category.id.toLowerCase()),
    );
    const addedCategories = [...new Set(
      products
        .map((product) => product.category?.trim())
        .filter((category) => category && !knownCategories.has(category.toLowerCase())),
    )].map((category) => ({ id: category, label: category, icon: "🧶" }));
    return [...CATEGORIES, ...addedCategories];
  }, [products]);

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

  return (
    <main className="shop-page">
      {/* Hero Intro Header */}
      <section className="shop-page__intro">
        <span className="eyebrow-pill">🌸 The Handmade Collection</span>
        <h1 className="shop-title">Find your little happy.</h1>
        <p className="shop-subtitle">
          Browse one-of-a-kind crochet pieces, looped slowly with milk cotton
          and lots of love.
        </p>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="shop-section shop-page__products">
        <div className="shop-controls">
          {/* Search Bar */}
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              className="shop-search-input"
              placeholder="Search by flower, bookmark, yarn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search crochet products"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div
            className="category-list"
            role="tablist"
            aria-label="Filter products by category"
          >
            {categories.map((cat) => {
              const isActive =
                selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`category-chip ${isActive ? "category-chip--active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="category-chip__icon">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Filter Counter Header */}
        <div className="shop-section__heading">
          <div className="heading-left">
            <span className="eyebrow">MADE JUST FOR YOU</span>
            <h2>Shop all treasures</h2>
          </div>
          <div className="heading-right">
            <span className="item-count-badge">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "treasure" : "treasures"} found
            </span>
          </div>
        </div>

        {/* Empty Search Fallback or Product Grid */}
        {!loading && filteredProducts.length === 0 ? (
          <div className="empty-catalog-state">
            <div className="empty-catalog-icon" aria-hidden="true">
              🧶
            </div>
            <h3>No little treasures found</h3>
            <p>
              We couldn't find anything matching your search. Try another yarn
              type or reset filters.
            </p>
            <button
              type="button"
              className="reset-filter-btn"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            onAddToCart={onAddToCart}
            selectedCategory={selectedCategory}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </section>
    </main>
  );
}
