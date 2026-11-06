import { useState } from "react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://fayzo-crochet-api.onrender.com"
).replace(/\/+$/, "");

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    pincode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister
      ? formData
      : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (!data.token || !data.user) {
        throw new Error("The server did not return a valid sign-in session.");
      }
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          maxWidth: "420px",
          width: "100%",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          border: "1px solid #EFE5DF",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.2rem",
          }}
        >
          <h2 style={{ margin: 0, color: "#4A3E3D", fontSize: "1.4rem" }}>
            {isRegister ? "Create Customer Account 🌸" : "Welcome Back 🧶"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.3rem",
              cursor: "pointer",
              color: "#8E736C",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FDECEC",
              color: "#A83232",
              padding: "8px 12px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        >
          {isRegister && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  WhatsApp / Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Delivery Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#8B3E54",
              color: "#FFF",
              border: "none",
              padding: "12px",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "0.5rem",
            }}
          >
            {loading ? "Processing..." : isRegister ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#8B3E54",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {isRegister
              ? "Already have an account? Log In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #DDD",
  fontSize: "0.9rem",
};
