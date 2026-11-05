import { useEffect, useState } from "react";
import ProductReviews from "../components/ProductReviews";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order received", icon: "⏳" },
  { key: "CROCHETING", label: "Crocheting", icon: "🧶" },
  { key: "DISPATCHED", label: "Dispatched", icon: "📦" },
  { key: "COMPLETED", label: "Delivered", icon: "🌸" },
];

function getOrderItems(order) {
  if (!order.orderedItemsSummary) return null;

  try {
    const items = JSON.parse(order.orderedItemsSummary);
    return Array.isArray(items) ? items : null;
  } catch {
    return null;
  }
}

function OrderCard({ order, authToken, onOpenAuth }) {
  const statusIndex = STATUS_STEPS.findIndex(
    (step) => step.key === order.status,
  );
  const activeStep = statusIndex < 0 ? 0 : statusIndex;
  const items = getOrderItems(order);

  return (
    <article className="track-order-card">
      <header className="track-order-card__header">
        <div>
          <span className="eyebrow">ORDER #{order.id}</span>
          <p>
            {order.orderDate
              ? new Date(order.orderDate).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Order date unavailable"}
          </p>
        </div>
        <div className="track-order-card__amount">
          <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
          <span>{order.paymentMethod || "Payment preference not set"}</span>
          {order.paymentMethod === "UPI / GPay" && (
            <span className="track-order-card__payment-status">
              {order.paymentStatus === "PAID"
                ? "Payment verified"
                : "Payment awaiting verification"}
            </span>
          )}
        </div>
      </header>

      <div
        className="track-order-timeline"
        aria-label={`Order status: ${STATUS_STEPS[activeStep].label}`}
      >
        {STATUS_STEPS.map((step, index) => (
          <div
            className={`track-order-timeline__step${index <= activeStep ? " is-complete" : ""}${index === activeStep ? " is-current" : ""}`}
            key={step.key}
          >
            <span className="track-order-timeline__icon" aria-hidden="true">
              {step.icon}
            </span>
            <span>{step.label}</span>
          </div>
        ))}
      </div>

      <section className="track-order-card__details">
        <h3>Items in this order</h3>
        {items?.length ? (
          <ul>
            {items.map((item, index) => {
              const quantity = Number(item.quantity || 0);
              const price = Number(item.price || 0);
              const itemName = item.name || `Product ${item.productId || ""}`;
              return (
                <li key={`${item.productId || itemName}-${index}`}>
                  <div className="track-order-card__item">
                    <span>
                      {itemName} <small>× {quantity}</small>
                    </span>
                    <strong>₹{(price * quantity).toFixed(2)}</strong>
                  </div>
                  {order.status === "COMPLETED" && item.productId != null && (
                    <ProductReviews
                      productId={item.productId}
                      authToken={authToken}
                      onOpenAuth={onOpenAuth}
                      formOnly
                    />
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="track-order-card__legacy">
            {order.orderedItemsSummary ||
              "Item details aren’t available for this order."}
          </p>
        )}
      </section>

      <div className="track-order-card__shipping">
        <strong>Delivering to {order.customerName}</strong>
        <span>
          {order.address}, {order.pincode}
        </span>
      </div>
    </article>
  );
}

export default function TrackOrderPage({
  authToken,
  currentUser,
  onOpenAuth,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!authToken || !currentUser) return undefined;

    let active = true;
    fetch("http://localhost:8080/api/orders/user", {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (response) => {
        if (response.status === 401) {
          throw new Error("Your sign-in session expired. Please sign in again.");
        }
        if (!response.ok) {
          throw new Error("We couldn't load your orders. Please try again.");
        }
        return response.json();
      })
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authToken, currentUser]);

  return (
    <main className="track-orders-page">
      <header className="track-orders-page__intro">
        <span className="eyebrow">A LITTLE UPDATE FROM OUR STUDIO</span>
        <h1>Your orders</h1>
        <p>
          {currentUser
            ? `Hi ${currentUser.name || "there"}! Here are the handmade pieces linked to your account.`
            : "Sign in to see the orders and delivery details linked to your account."}
        </p>
      </header>

      {!currentUser || !authToken ? (
        <section className="track-orders-message">
          <span aria-hidden="true">🔐</span>
          <h2>Sign in to track your orders</h2>
          <p>
            Your order details are private to your customer account. Sign in
            with the email you used at checkout to see them here.
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={onOpenAuth}
          >
            Sign in or create an account
          </button>
        </section>
      ) : loading ? (
        <p className="track-orders-message" role="status">
          Finding your orders...
        </p>
      ) : errorMessage ? (
        <section className="track-orders-message track-orders-message--error" role="alert">
          <h2>We couldn’t load your orders</h2>
          <p>{errorMessage}</p>
        </section>
      ) : orders.length === 0 ? (
        <section className="track-orders-message">
          <span aria-hidden="true">🧺</span>
          <h2>No orders yet</h2>
          <p>Your future handmade treasures will appear here after checkout.</p>
        </section>
      ) : (
        <div className="track-orders-list">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              authToken={authToken}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      )}
    </main>
  );
}
