export default function CartDrawer({
  isOpen,
  cart,
  total,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  if (!isOpen) return null;
  const hasOutOfStockItems = cart.some((item) => item.inStock === false);

  return (
    <div className="cart-overlay" onMouseDown={onClose}>
      <aside
        aria-label="Shopping basket"
        aria-modal="true"
        role="dialog"
        className="cart-drawer"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cart-drawer__header">
          <div>
            <span className="eyebrow">YOUR LITTLE FINDS</span>
            <h2>Your basket</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close basket"
          >
            ✕
          </button>
        </div>

        <div className="cart-drawer__items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span aria-hidden="true">🧺</span>
              <p>Your basket is waiting for something lovely.</p>
              <button className="text-button" onClick={onClose}>
                Keep browsing
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item__image" aria-hidden="true">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" />
                  ) : (
                    "🧸"
                  )}
                </div>
                <div className="cart-item__details">
                  <strong>{item.name}</strong>
                  <span>₹{Number(item.price).toFixed(2)} each</span>
                  <span
                    className={`cart-item__stock ${
                      item.inStock === false
                        ? "cart-item__stock--unavailable"
                        : "cart-item__stock--available"
                    }`}
                  >
                    {item.inStock === false ? "Out of stock" : "In stock"}
                  </span>
                  <div className="cart-item__quantity">
                    <span className="cart-item__quantity-label">Quantity</span>
                    <div
                      className="cart-quantity-control"
                      role="group"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      <button
                        className="cart-quantity-button"
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        disabled={item.qty <= 1}
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </button>
                      <span
                        className="cart-quantity-value"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {item.qty}
                      </span>
                      <button
                        className="cart-quantity-button"
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        disabled={item.inStock === false}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-remove-button"
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Remove ${item.name} from basket`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <strong className="cart-item__price">
                  ₹{(item.price * item.qty).toFixed(2)}
                </strong>
              </div>
            ))
          )}
        </div>

        <div className="cart-drawer__footer">
          <div className="cart-total">
            <span>Subtotal</span>
            <strong>₹{total}</strong>
          </div>
          <p>Shipping and any discounts are calculated at checkout.</p>
          {hasOutOfStockItems && (
            <p className="cart-drawer__stock-warning" role="alert">
              Remove out-of-stock items before checking out.
            </p>
          )}
          <button
            className="checkout-button"
            onClick={onCheckout}
            disabled={cart.length === 0 || hasOutOfStockItems}
          >
            Checkout <span aria-hidden="true">→</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
