import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../asset/logo.jpg";

export default function Navbar({
  cartItemCount,
  favoriteCount,
  currentUser,
  onCartClick,
  onOpenAuth,
  onLogout,
}) {
  const isAdminPage = useLocation().pathname === "/admin";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="announcement">
        <span aria-hidden="true">✿</span> A little handmade happiness in every
        order <span aria-hidden="true">✿</span>
      </div>
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="Fayzo Crochet Co. home">
          <img className="brand__logo" src={logo} alt="Fayzo Crochet Co." />
        </NavLink>
        <nav
          className={`main-nav${isMobileMenuOpen ? " main-nav--open" : ""}`}
          id="main-navigation"
          aria-label="Main navigation"
        >
          <NavLink to="/shop" onClick={() => setIsMobileMenuOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/#our-story" onClick={() => setIsMobileMenuOpen(false)}>
            Our story
          </NavLink>
          <NavLink
            className="track-order-link"
            to="/track"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Track Order
          </NavLink>
        </nav>
        <div className="header-actions">
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <span aria-hidden="true">{isMobileMenuOpen ? "×" : "☰"}</span>
          </button>
          {!isAdminPage && (currentUser ? (
            <button
              className="account-button"
              type="button"
              onClick={onLogout}
              title={`Signed in as ${currentUser.name || currentUser.email}`}
            >
              Sign out
            </button>
          ) : (
            <button
              className="account-button"
              type="button"
              onClick={onOpenAuth}
            >
              Sign in
            </button>
          ))}
          {!isAdminPage && (
            <NavLink
              className="saved-link"
              to="/saved"
              aria-label={`Saved Treasures, ${favoriteCount} saved`}
              title="Saved Treasures"
            >
              <span aria-hidden="true">♥</span>
              <span className="saved-count">{favoriteCount}</span>
            </NavLink>
          )}
          {!isAdminPage && (
            <button className="cart-button" onClick={onCartClick}>
              <span aria-hidden="true">🛍️</span>
              <span>My basket</span>
              <span className="cart-count">{cartItemCount}</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
}
