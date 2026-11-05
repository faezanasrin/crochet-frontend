import { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useParams } from "react-router-dom";
import "./App.css";
import AuthModal from "./components/AuthModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import HomePage from "./pages/HomePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ShopPage from "./pages/ShopPage";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("crochet_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("crochet_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("crochet_cart", JSON.stringify(cart));
  }, [cart]);

  const handleLogout = () => {
    localStorage.removeItem("crochet_user");
    setCurrentUser(null);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2);
  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <BrowserRouter>
      <div className="storefront">
        {/* Navigation Bar */}
        <Navbar
          cartItemCount={totalCartItems}
          onCartClick={() => setIsCartOpen((prev) => !prev)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        <Routes>
          <Route path="/" element={<HomePage products={products} loading={loading} onAddToCart={addToCart} />} />
          <Route path="/shop" element={<ShopPage products={products} loading={loading} onAddToCart={addToCart} />} />
          <Route path="/my-orders" element={<MyOrdersPage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/admin" element={<AdminOrdersPage />} />
        </Routes>

        <Footer />

        <CartDrawer
          isOpen={isCartOpen}
          cart={cart}
          total={totalCartPrice}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={(id, delta) => setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))}
          onRemoveItem={(id) => setCart((prev) => prev.filter((i) => i.id !== id))}
          onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          cart={cart}
          currentUser={currentUser}
          totalAmount={totalCartPrice}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={() => {
            setCart([]);
            localStorage.removeItem("crochet_cart");
            setIsCheckoutOpen(false);
          }}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(user) => setCurrentUser(user)}
        />
      </div>
    </BrowserRouter>
  );
}