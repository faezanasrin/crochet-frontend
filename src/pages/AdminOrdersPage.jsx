import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

const emptyProduct = {
  name: "",
  price: "",
  category: "",
  yarnType: "",
  imageUrl: "",
  inStock: true,
};

export default function AdminOrdersPage({ onProductsChanged }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminToken, setAdminToken] = useState(
    () => sessionStorage.getItem("crochet_admin_token") || "",
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productRefreshKey, setProductRefreshKey] = useState(0);

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  };

  useEffect(() => {
    if (!adminToken) return undefined;

    let active = true;
    fetch(`${API_BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Could not retrieve orders.");
        }
        return res.json();
      })
      .then((data) => {
        if (active) setOrders(data.reverse());
      })
      .catch((err) => {
        if (active)
          setError(err.message || "Failed to connect to backend server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [adminToken, refreshKey]);

  useEffect(() => {
    if (!adminToken) return undefined;

    let active = true;
    fetch(`${API_BASE_URL}/api/products`)
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Could not retrieve products.");
        }
        return response.json();
      })
      .then((data) => {
        if (active) {
          setProducts(data);
          setProductsError("");
        }
      })
      .catch((requestError) => {
        if (active) setProductsError(requestError.message);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [adminToken, productRefreshKey]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Admin sign-in failed.");
      }

      sessionStorage.setItem("crochet_admin_token", data.token);
      setLoading(true);
      setAdminToken(data.token);
      setPasswordInput("");
      setAuthError("");
    } catch (error) {
      setAuthError(
        error.message || "Unable to sign in to the admin dashboard.",
      );
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch (error) {
      console.error("Admin sign-out request failed:", error);
    }
    sessionStorage.removeItem("crochet_admin_token");
    setAdminToken("");
    setPasswordInput("");
  };

  // Status Update Handler
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to update order status: ${res.statusText}`);
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handlePaymentConfirmation = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/payment`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || "Could not confirm this payment.");
      }

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId ? { ...order, paymentStatus: "PAID" } : order,
        ),
      );
    } catch (requestError) {
      setError(requestError.message || "Could not confirm this payment.");
    }
  };

  const resetProductForm = () => {
    setProductForm(emptyProduct);
    setEditingProductId(null);
    setProductsError("");
  };

  const handleProductFormChange = (event) => {
    const { name, value, checked, type } = event.target;
    setProductForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setProductsError("");
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setIsSavingProduct(true);
    setProductsError("");

    const productPayload = {
      ...productForm,
      price: Number(productForm.price),
    };
    const isEditing = editingProductId !== null;

    try {
      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/products/${editingProductId}`
          : `${API_BASE_URL}/api/products`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(productPayload),
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || "Could not save this product.");
      }

      setProducts((previous) =>
        isEditing
          ? previous.map((product) => (product.id === body.id ? body : product))
          : [...previous, body],
      );
      resetProductForm();
      onProductsChanged?.();
    } catch (requestError) {
      setProductsError(requestError.message || "Could not save this product.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const startEditingProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      category: product.category || "",
      yarnType: product.yarnType || "",
      imageUrl: product.imageUrl || "",
      inStock: Boolean(product.inStock),
    });
    setProductsError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProductStockChange = async (product, inStock) => {
    setProductsError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ ...product, inStock }),
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || "Could not update product stock.");
      }
      setProducts((previous) =>
        previous.map((item) => (item.id === body.id ? body : item)),
      );
      onProductsChanged?.();
    } catch (requestError) {
      setProductsError(
        requestError.message || "Could not update product stock.",
      );
    }
  };

  const handleProductDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}" from the catalog?`)) return;
    setProductsError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Could not delete this product.");
      }
      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id),
      );
      if (editingProductId === product.id) resetProductForm();
      onProductsChanged?.();
    } catch (requestError) {
      setProductsError(
        requestError.message || "Could not delete this product.",
      );
    }
  };

  const formatWhatsAppLink = (phone, customerName, orderId, status) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91")
      ? cleanPhone
      : `91${cleanPhone}`;

    let message = `Hello ${customerName}! 🌸 Updating you on your Fayzo Crochet order (#${orderId}): `;
    if (status === "CROCHETING")
      message += "We have started crocheting your pieces! 🧶";
    else if (status === "DISPATCHED")
      message += "Your parcel has been handed over for delivery! 📦";
    else if (status === "COMPLETED")
      message +=
        "Your handmade order has been delivered! We hope you love it! 🌷";
    else message += "Your order has been received and confirmed!";

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "CROCHETING":
        return { bg: "#FFF4E5", color: "#B76E00", label: "🧶 Crocheting" };
      case "DISPATCHED":
        return { bg: "#EBF3FE", color: "#1E62D0", label: "📦 Dispatched" };
      case "COMPLETED":
        return { bg: "#EAF2EC", color: "#2B5738", label: "🌸 Delivered" };
      default:
        return { bg: "#FCE7EE", color: "#8B3E54", label: "⏳ Pending" };
    }
  };

  // ----------------- LOCK SCREEN -----------------
  if (!adminToken) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "75vh",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            padding: "2.5rem 2rem",
            maxWidth: "380px",
            width: "100%",
            textAlign: "center",
            border: "1px solid #EFE5DF",
            boxShadow: "0 10px 25px rgba(180, 150, 160, 0.1)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔐</div>
          <h2 style={{ color: "#4A3E3D", margin: "0 0 0.4rem 0" }}>
            Owner Access
          </h2>
          <p
            style={{
              color: "#8E736C",
              fontSize: "0.9rem",
              margin: "0 0 1.5rem 0",
            }}
          >
            Enter your secret password to view customer orders.
          </p>
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <input
              type="password"
              placeholder="Enter admin password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #DDD",
                fontSize: "1rem",
                textAlign: "center",
              }}
            />
            {authError && (
              <p style={{ color: "#C85555", fontSize: "0.85rem", margin: 0 }}>
                {authError}
              </p>
            )}
            <button
              type="submit"
              style={{
                backgroundColor: "#8B3E54",
                color: "#FFFFFF",
                border: "none",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Unlock Dashboard
            </button>
          </form>
          <div style={{ marginTop: "1.5rem" }}>
            <Link
              to="/shop"
              style={{
                color: "#8E736C",
                fontSize: "0.85rem",
                textDecoration: "none",
              }}
            >
              ← Return to store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- UNLOCKED DASHBOARD -----------------
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem",
        minHeight: "80vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <span
            style={{
              backgroundColor: "#FCE7EE",
              color: "#8B3E54",
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "0.8rem",
              fontWeight: "700",
            }}
          >
            Store Management
          </span>
          <h1
            style={{ margin: "0.5rem 0 0", color: "#4A3E3D", fontSize: "2rem" }}
          >
            {activeTab === "orders"
              ? "Incoming Customer Orders 📋"
              : "Product Inventory 🧶"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {activeTab === "orders" ? (
            <button
              onClick={fetchOrders}
              style={{
                backgroundColor: "#FFF",
                border: "1px solid #DDD",
                padding: "8px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                color: "#6A3845",
              }}
            >
              🔄 Refresh
            </button>
          ) : (
            <button
              onClick={() => setProductRefreshKey((key) => key + 1)}
              style={{
                backgroundColor: "#FFF",
                border: "1px solid #DDD",
                padding: "8px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                color: "#6A3845",
              }}
            >
              🔄 Refresh
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#FFF0F0",
              border: "1px solid #EAA8A8",
              padding: "8px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              color: "#A83232",
            }}
          >
            🔒 Lock
          </button>
        </div>
      </div>

      <nav className="admin-tabs" aria-label="Admin sections">
        <button
          aria-pressed={activeTab === "orders"}
          className={
            activeTab === "orders"
              ? "admin-tabs__button is-active"
              : "admin-tabs__button"
          }
          onClick={() => setActiveTab("orders")}
          type="button"
        >
          Orders
        </button>
        <button
          aria-pressed={activeTab === "inventory"}
          className={
            activeTab === "inventory"
              ? "admin-tabs__button is-active"
              : "admin-tabs__button"
          }
          onClick={() => setActiveTab("inventory")}
          type="button"
        >
          Inventory / Add Product
        </button>
      </nav>

      {activeTab === "orders" &&
        (loading ? (
          <p
            style={{ textAlign: "center", color: "#8E736C", marginTop: "3rem" }}
          >
            Loading orders... 🧶
          </p>
        ) : error ? (
          <div
            style={{
              backgroundColor: "#FDECEC",
              color: "#A83232",
              padding: "1.2rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "3rem",
              borderRadius: "20px",
              textAlign: "center",
              border: "1px solid #EFE5DF",
            }}
          >
            <span style={{ fontSize: "3rem" }}>🧺</span>
            <h3 style={{ color: "#4A3E3D", marginTop: "1rem" }}>
              No orders placed yet
            </h3>
            <p style={{ color: "#8E736C" }}>
              When customers check out, their delivery details and orders will
              appear here.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {orders.map((order) => {
              const badge = getStatusBadgeStyle(order.status);
              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    border: "1px solid #EFE5DF",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      borderBottom: "1px solid #F5EDE8",
                      paddingBottom: "1rem",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: "#4A3E3D",
                            fontSize: "1.2rem",
                          }}
                        >
                          Order #{order.id}
                        </h3>
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                          }}
                        >
                          {badge.label}
                        </span>
                        <span
                          style={{
                            backgroundColor: "#F9F3EE",
                            color: "#7A6862",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                          }}
                        >
                          {order.paymentMethod}
                        </span>
                        {order.paymentMethod === "UPI / GPay" && (
                          <span
                            style={{
                              backgroundColor:
                                order.paymentStatus === "PAID"
                                  ? "#EAF2EC"
                                  : "#FFF4E5",
                              color:
                                order.paymentStatus === "PAID"
                                  ? "#2B5738"
                                  : "#8A5A00",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                            }}
                          >
                            {order.paymentStatus === "PAID"
                              ? "✓ Payment verified"
                              : "Payment pending verification"}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#8E736C",
                          fontSize: "0.85rem",
                        }}
                      >
                        Placed:{" "}
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleString()
                          : "Recently"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: "800",
                          color: "#B85B74",
                        }}
                      >
                        ₹
                        {order.totalAmount
                          ? Number(order.totalAmount).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: "1.2rem",
                      marginBottom: "1.2rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 6px",
                          fontSize: "0.9rem",
                          color: "#8B3E54",
                        }}
                      >
                        Customer & Shipping
                      </h4>
                      <p
                        style={{
                          margin: "2px 0",
                          fontWeight: "700",
                          color: "#3B2F2F",
                        }}
                      >
                        {order.customerName}
                      </p>
                      <p
                        style={{
                          margin: "2px 0",
                          fontSize: "0.85rem",
                          color: "#6A5C59",
                        }}
                      >
                        {order.address}
                      </p>
                      <p
                        style={{
                          margin: "2px 0",
                          fontSize: "0.85rem",
                          color: "#6A5C59",
                        }}
                      >
                        PIN: {order.pincode}
                      </p>
                    </div>

                    <div>
                      <h4
                        style={{
                          margin: "0 0 6px",
                          fontSize: "0.9rem",
                          color: "#8B3E54",
                        }}
                      >
                        Items & Custom Requests
                      </h4>
                      {order.customNotes && (
                        <div
                          style={{
                            backgroundColor: "#FFF8F0",
                            border: "1px dashed #E5C3AB",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              color: "#9E643E",
                            }}
                          >
                            Customization Note:
                          </span>
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: "0.85rem",
                              color: "#634735",
                            }}
                          >
                            "{order.customNotes}"
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          backgroundColor: "#FDFBF7",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #F1E5DF",
                        }}
                      >
                        <pre
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            color: "#4A3E3D",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                          }}
                        >
                          {order.orderedItemsSummary}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {order.paymentMethod === "UPI / GPay" && (
                    <div
                      style={{
                        marginBottom: "1rem",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        backgroundColor: "#FFF9F2",
                        border: "1px solid #F1E5DF",
                        color: "#6A5C59",
                        fontSize: "0.85rem",
                      }}
                    >
                      <strong>Customer UPI transaction ID:</strong>{" "}
                      {order.paymentReference || "Not provided"}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #F5EDE8",
                      paddingTop: "1rem",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          color: "#6A5C59",
                        }}
                      >
                        Set Status:
                      </span>
                      {[
                        { key: "PENDING", label: "⏳ Pending" },
                        { key: "CROCHETING", label: "🧶 Crocheting" },
                        { key: "DISPATCHED", label: "📦 Dispatched" },
                        { key: "COMPLETED", label: "🌸 Delivered" },
                      ].map((step) => (
                        <button
                          key={step.key}
                          onClick={() => handleStatusChange(order.id, step.key)}
                          style={{
                            backgroundColor:
                              order.status === step.key ? "#8B3E54" : "#F4ECE7",
                            color:
                              order.status === step.key ? "#FFF" : "#5A4C48",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          {step.label}
                        </button>
                      ))}
                    </div>

                    {order.paymentMethod === "UPI / GPay" &&
                      order.paymentStatus !== "PAID" && (
                        <button
                          onClick={() => handlePaymentConfirmation(order.id)}
                          style={{
                            backgroundColor: "#EAF2EC",
                            color: "#2B5738",
                            border: "1px solid #B9D2C0",
                            padding: "7px 12px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Confirm UPI payment
                        </button>
                      )}

                    <a
                      href={formatWhatsAppLink(
                        order.phone,
                        order.customerName,
                        order.id,
                        order.status,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "#25D366",
                        color: "#FFFFFF",
                        padding: "7px 14px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                      }}
                    >
                      💬 Send Status Update on WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {activeTab === "inventory" && (
        <section className="admin-inventory">
          <form className="admin-product-form" onSubmit={handleProductSubmit}>
            <div className="admin-product-form__heading">
              <div>
                <span className="eyebrow">
                  {editingProductId ? "UPDATE LISTING" : "GROW YOUR COLLECTION"}
                </span>
                <h2>{editingProductId ? "Edit product" : "Add a product"}</h2>
              </div>
              {editingProductId && (
                <button
                  className="admin-product-form__cancel"
                  onClick={resetProductForm}
                  type="button"
                >
                  Cancel edit
                </button>
              )}
            </div>
            <div className="admin-product-form__grid">
              <label>
                <span>Product name</span>
                <input
                  maxLength="255"
                  name="name"
                  onChange={handleProductFormChange}
                  required
                  value={productForm.name}
                />
              </label>
              <label>
                <span>Price (₹)</span>
                <input
                  min="0.01"
                  name="price"
                  onChange={handleProductFormChange}
                  required
                  step="0.01"
                  type="number"
                  value={productForm.price}
                />
              </label>
              <label>
                <span>Category</span>
                <input
                  list="product-categories"
                  maxLength="255"
                  name="category"
                  onChange={handleProductFormChange}
                  required
                  value={productForm.category}
                />
                <datalist id="product-categories">
                  {[
                    "Bookmarks",
                    "Flowers",
                    "Bouquets",
                    "Keychains",
                    "Amigurumi",
                    "Tote Bags",
                    "Wearables",
                  ].map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>
              <label>
                <span>Yarn type</span>
                <input
                  maxLength="255"
                  name="yarnType"
                  onChange={handleProductFormChange}
                  required
                  value={productForm.yarnType}
                />
              </label>
              <label className="admin-product-form__image">
                <span>Image URL</span>
                <input
                  maxLength="255"
                  name="imageUrl"
                  onChange={handleProductFormChange}
                  placeholder="https://... or /assets/..."
                  required
                  type="text"
                  value={productForm.imageUrl}
                />
              </label>
              <label className="admin-product-form__stock">
                <input
                  checked={productForm.inStock}
                  name="inStock"
                  onChange={handleProductFormChange}
                  type="checkbox"
                />
                <span>In stock and available for purchase</span>
              </label>
            </div>
            {productsError && (
              <p className="admin-inventory__error" role="alert">
                {productsError}
              </p>
            )}
            <button
              className="admin-product-form__submit"
              disabled={isSavingProduct}
              type="submit"
            >
              {isSavingProduct
                ? "Saving…"
                : editingProductId
                  ? "Save changes"
                  : "Add product"}
            </button>
          </form>

          <div className="admin-inventory__list-heading">
            <div>
              <span className="eyebrow">YOUR CATALOG</span>
              <h2>Products ({products.length})</h2>
            </div>
          </div>
          {productsLoading ? (
            <p role="status">Loading products…</p>
          ) : productsError && products.length === 0 ? (
            <p className="admin-inventory__error" role="alert">
              {productsError}
            </p>
          ) : products.length === 0 ? (
            <p className="admin-inventory__empty">
              No products yet. Add the first one above.
            </p>
          ) : (
            <div className="admin-product-list">
              {products.map((product) => (
                <article className="admin-product-card" key={product.id}>
                  <img alt="" src={product.imageUrl} />
                  <div className="admin-product-card__details">
                    <strong>{product.name}</strong>
                    <span>
                      {product.category} · {product.yarnType}
                    </span>
                    <b>₹{Number(product.price).toFixed(2)}</b>
                    <span
                      className={
                        product.inStock
                          ? "admin-product-card__stock is-in-stock"
                          : "admin-product-card__stock"
                      }
                    >
                      {product.inStock ? "In stock" : "Out of stock"}
                    </span>
                  </div>
                  <div className="admin-product-card__actions">
                    <button
                      onClick={() =>
                        handleProductStockChange(product, !product.inStock)
                      }
                      type="button"
                    >
                      Mark {product.inStock ? "out of stock" : "in stock"}
                    </button>
                    <button
                      onClick={() => startEditingProduct(product)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="is-danger"
                      onClick={() => handleProductDelete(product)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
