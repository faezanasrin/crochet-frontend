import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import "./App.css";
import AuthModal from "./components/AuthModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SavedTreasuresPage from "./pages/SavedTreasuresPage";
import ShopPage from "./pages/ShopPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import { API_BASE_URL } from "./utils/api";

function readFavoriteIds() {
  try {
    const saved = JSON.parse(localStorage.getItem("crochet_favorites") || "[]");
    return Array.isArray(saved) ? saved.map(String) : [];
  } catch {
    return [];
  }
}

function readStoredSession() {
  localStorage.removeItem("crochet_user");
  const authToken = sessionStorage.getItem("crochet_auth_token");
  if (!authToken) return { authToken: "", currentUser: null };

  try {
    const currentUser = JSON.parse(
      sessionStorage.getItem("crochet_user") || "null",
    );
    if (!currentUser) throw new Error("Stored customer profile is missing.");
    return { authToken, currentUser };
  } catch {
    sessionStorage.removeItem("crochet_user");
    sessionStorage.removeItem("crochet_auth_token");
    return { authToken: "", currentUser: null };
  }
}

function ProductRoute({
  products,
  loading,
  onAddToCart,
  favoriteIds,
  onToggleFavorite,
  authToken,
  onOpenAuth,
}) {
  const { productId } = useParams();
  const product = products.find((item) => String(item.id) === productId);

  if (loading) {
    return (
      <div className="page-loading" role="status">
        Finding your little treasure...
      </div>
    );
  }

  if (!product) {
    return (
      <section className="not-found">
        <span aria-hidden="true">🌷</span>
        <h1>We couldn't find that little treasure.</h1>
        <Link className="primary-button" to="/shop">
          Browse the shop <span aria-hidden="true">→</span>
        </Link>
      </section>
    );
  }

  return (
    <ProductDetailPage
      product={product}
      onAddToCart={onAddToCart}
      isFavorite={favoriteIds.includes(String(product.id))}
      onToggleFavorite={onToggleFavorite}
      authToken={authToken}
      onOpenAuth={onOpenAuth}
    />
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(readFavoriteIds);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [checkoutAfterAuth, setCheckoutAfterAuth] = useState(false);
  const [authSession, setAuthSession] = useState(readStoredSession);
  const { authToken, currentUser } = authSession;

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("crochet_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((response) => {
        if (!response.ok) throw new Error("Backend connection failed");
        return response.json();
      })
      .then(setProducts)
      .catch((error) => console.error("Product API error:", error))
      .finally(() => setLoading(false));
  }, [productsRefreshKey]);

  useEffect(() => {
    localStorage.setItem("crochet_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("crochet_favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (productId) => {
    const id = String(productId);
    setFavoriteIds((previous) =>
      previous.includes(id)
        ? previous.filter((favoriteId) => favoriteId !== id)
        : [...previous, id],
    );
  };

  const addToCart = (item) => {
    setCart((previous) => {
      const existing = previous.find((product) => product.id === item.id);
      if (existing) {
        return previous.map((product) =>
          product.id === item.id
            ? { ...product, qty: product.qty + 1 }
            : product,
        );
      }
      return [...previous, { ...item, qty: 1 }];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((previous) =>
      previous.map((item) =>
        item.id === productId
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart((previous) => previous.filter((item) => item.id !== productId));
  };

  const handleAuthSuccess = (user, token) => {
    sessionStorage.setItem("crochet_auth_token", token);
    sessionStorage.setItem("crochet_user", JSON.stringify(user));
    setAuthSession({ authToken: token, currentUser: user });
    setIsAuthOpen(false);

    if (checkoutAfterAuth) {
      setCheckoutAfterAuth(false);
      setIsCheckoutOpen(true);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch (error) {
        console.error("Sign out request failed:", error);
      }
    }
    sessionStorage.removeItem("crochet_auth_token");
    sessionStorage.removeItem("crochet_user");
    setAuthSession({ authToken: "", currentUser: null });
  };

  const totalCartPrice = cart
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);
  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <BrowserRouter>
      <div className="storefront">
        <Navbar
          cartItemCount={totalCartItems}
          favoriteCount={favoriteIds.length}
          currentUser={currentUser}
          onCartClick={() => setIsCartOpen((isOpen) => !isOpen)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                loading={loading}
                onAddToCart={addToCart}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <ShopPage
                products={products}
                loading={loading}
                onAddToCart={addToCart}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route
            path="/products/:productId"
            element={
              <ProductRoute
                products={products}
                loading={loading}
                onAddToCart={addToCart}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                authToken={authToken}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <SavedTreasuresPage
                products={products}
                loading={loading}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
              />
            }
          />
          <Route
            path="/track"
            element={
              <TrackOrderPage
                key={authToken || "signed-out"}
                authToken={authToken}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminOrdersPage
                onProductsChanged={() =>
                  setProductsRefreshKey((key) => key + 1)
                }
              />
            }
          />
          <Route
            path="*"
            element={
              <section className="not-found">
                <span aria-hidden="true">🧶</span>
                <h1>Oops, this page wandered off.</h1>
                <Link className="primary-button" to="/">
                  Back to home <span aria-hidden="true">→</span>
                </Link>
              </section>
            }
          />
        </Routes>
        <Footer
          authToken={authToken}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        <CartDrawer
          isOpen={isCartOpen}
          cart={cart}
          total={totalCartPrice}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => {
            setIsCartOpen(false);
            if (authToken) {
              setIsCheckoutOpen(true);
            } else {
              setCheckoutAfterAuth(true);
              setIsAuthOpen(true);
            }
          }}
        />

        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            authToken={authToken}
            currentUser={currentUser}
            cart={cart}
            totalAmount={totalCartPrice}
            onClose={() => setIsCheckoutOpen(false)}
            onOrderSuccess={() => {
              setCart([]);
              localStorage.removeItem("crochet_cart");
              setIsCartOpen(false);
            }}
          />
        )}

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            setIsAuthOpen(false);
            setCheckoutAfterAuth(false);
          }}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </BrowserRouter>
  );
}
