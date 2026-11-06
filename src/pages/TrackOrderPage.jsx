import { useEffect, useRef, useState } from "react";
import ProductReviews from "../components/ProductReviews";
import { API_BASE_URL } from "../utils/api";

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

function OrderCard({
  order,
  authToken,
  onOpenAuth,
  onCancel,
  isCancelling,
  onDelete,
  isDeleting,
  isSwipeOpen,
  onSwipeOpen,
}) {
  const statusIndex = STATUS_STEPS.findIndex(
    (step) => step.key === order.status,
  );
  const activeStep = statusIndex < 0 ? 0 : statusIndex;
  const items = getOrderItems(order);
  const isTerminalOrder = ["REJECTED", "CANCELLED"].includes(order.status);
  const terminalStatusLabel =
    order.status === "REJECTED" ? "Order rejected" : "Order cancelled";
  const canDeleteOrder = ["COMPLETED", "REJECTED", "CANCELLED"].includes(
    order.status,
  );
  const touchStart = useRef(null);

  const handleTouchStart = (event) => {
    if (!canDeleteOrder) return;
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (!canDeleteOrder || !touchStart.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      onSwipeOpen(deltaX < 0 ? order.id : null);
    }
  };

  return (
    <div
      className={`track-order-card-swipe${isSwipeOpen ? " is-swipe-open" : ""}`}
      onTouchCancel={() => {
        touchStart.current = null;
      }}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      {canDeleteOrder && (
        <div className="track-order-card-swipe__action">
          <button
            aria-label={`Remove order ${order.id} from your order history`}
            disabled={isDeleting}
            onClick={() => onDelete(order)}
            type="button"
          >
            {isDeleting ? "…" : "Delete"}
          </button>
        </div>
      )}
      <article
        className={`track-order-card${isSwipeOpen ? " is-swipe-open" : ""}`}
      >
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
          <div className="track-order-card__amount-primary">
            <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
            {canDeleteOrder && (
              <button
                aria-label={`Remove order ${order.id} from your order history`}
                className="track-order-card__delete"
                disabled={isDeleting}
                onClick={() => onDelete(order)}
                title="Remove order from your history"
                type="button"
              >
                ×
              </button>
            )}
          </div>
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

      {isTerminalOrder ? (
        <section
          className={`track-order-terminal track-order-terminal--${order.status.toLowerCase()}`}
          aria-label={`Order status: ${terminalStatusLabel}`}
        >
          <strong>{terminalStatusLabel}</strong>
          {order.paymentMethod === "UPI / GPay" &&
            order.paymentStatus === "PAID" && (
            <p>
              Your refund will be initiated to your original payment account
              within 2–5 days.
            </p>
          )}
        </section>
      ) : (
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
      )}

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
      {order.status === "PENDING" && (
        <div className="track-order-card__actions">
          <button
            className="track-order-card__cancel"
            disabled={isCancelling}
            onClick={() => onCancel(order)}
            type="button"
          >
            {isCancelling ? "Cancelling…" : "Cancel this order"}
          </button>
        </div>
      )}
      </article>
    </div>
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
  const [actionError, setActionError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [swipedOrderId, setSwipedOrderId] = useState(null);

  useEffect(() => {
    if (!authToken || !currentUser) return undefined;

    let active = true;
    let isFetching = false;

    const refreshOrders = async () => {
      if (!active || isFetching) return;
      isFetching = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/user`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 401) {
          throw new Error("Your sign-in session expired. Please sign in again.");
        }
        if (!response.ok) {
          throw new Error("We couldn't load your orders. Please try again.");
        }
        const data = await response.json();
        if (active) {
          setOrders(data);
          setErrorMessage("");
        }
      } catch (error) {
        if (active) setErrorMessage(error.message);
      } finally {
        isFetching = false;
        if (active) setLoading(false);
      }
    };

    refreshOrders();
    const refreshInterval = window.setInterval(refreshOrders, 60_000);
    window.addEventListener("focus", refreshOrders);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshOrders);
    };
  }, [authToken, currentUser]);

  const handleCancelOrder = async (order) => {
    if (
      !window.confirm(
        `Cancel order #${order.id}? This can only be done before work begins.`,
      )
    ) {
      return;
    }

    setActionError("");
    setCancellingOrderId(order.id);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${order.id}/cancel`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || "Could not cancel this order.");
      }

      setOrders((previous) =>
        previous.map((item) => (item.id === order.id ? body : item)),
      );
    } catch (error) {
      setActionError(error.message || "Could not cancel this order.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (
      !window.confirm(
        `Remove order #${order.id} from your order history? This cannot be undone.`,
      )
    ) {
      return;
    }

    setActionError("");
    setDeletingOrderId(order.id);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${order.id}/user`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || "Could not remove this order.");
      }

      setOrders((previous) => previous.filter((item) => item.id !== order.id));
      setSwipedOrderId(null);
    } catch (error) {
      setActionError(error.message || "Could not remove this order.");
    } finally {
      setDeletingOrderId(null);
    }
  };

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
          {actionError && (
            <p className="track-order-action-error" role="alert">
              {actionError}
            </p>
          )}
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              authToken={authToken}
              onOpenAuth={onOpenAuth}
              onCancel={handleCancelOrder}
              isCancelling={cancellingOrderId === order.id}
              onDelete={handleDeleteOrder}
              isDeleting={deletingOrderId === order.id}
              isSwipeOpen={swipedOrderId === order.id}
              onSwipeOpen={setSwipedOrderId}
            />
          ))}
        </div>
      )}
    </main>
  );
}
