import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const UPI_ID = "faezanasrinmb@oksbi";
const UPI_PAYEE_NAME = "Fayzo Crochet Co.";

const initialFormData = {
  customerName: "",
  phone: "",
  address: "",
  pincode: "",
  customNotes: "",
  paymentMethod: "UPI / GPay",
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const formatReceiptDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

function createUpiPaymentUri(amount, reference) {
  const parameters = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    am: Number(amount).toFixed(2),
    cu: "INR",
    tn: `Fayzo order ${reference}`,
    tr: reference,
  });
  return `upi://pay?${parameters.toString()}`;
}

function downloadReceipt(receipt) {
  const paymentNote =
    receipt.paymentMethod === "Cash on Delivery"
      ? "Payment is due when your order is delivered."
      : `${receipt.paymentStatus === "PAID" ? "UPI payment verified." : "UPI payment is awaiting manual verification."} Transaction ID: ${receipt.paymentReference || "not provided"}.`;
  const itemsMarkup = receipt.items
    .map(
      (item) => `
        <div class="receipt-item">
          <div class="receipt-item__details">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${item.quantity} × ₹${Number(item.price).toFixed(2)}</span>
          </div>
          <strong>₹${(item.quantity * item.price).toFixed(2)}</strong>
        </div>`,
    )
    .join("");
  const notesMarkup = receipt.customNotes
    ? `<section class="receipt-section receipt-notes"><span>Customization notes</span><p>${escapeHtml(receipt.customNotes)}</p></section>`
    : "";
  const receiptHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fayzo Crochet Co. receipt ${escapeHtml(receipt.receiptNumber)}</title>
  <style>
    .receipt-page, .receipt-page * { box-sizing: border-box; }
    .receipt-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px 10px; margin: 0; background: #f3ede3; color: #453b32; font: 13px/1.45 "DM Sans", Arial, sans-serif; }
    .receipt-paper { position: relative; width: min(100%, 340px); margin: auto; padding: 18px 20px; background: #fffdf8; box-shadow: 0 3px 12px rgba(77, 57, 39, 0.08); }
    .receipt-paper::before, .receipt-paper::after { position: absolute; right: 0; left: 0; height: 9px; content: ""; pointer-events: none; }
    .receipt-paper::before { top: 0; background: radial-gradient(circle at 8px 0, #f3ede3 7px, transparent 7.5px) 0 0 / 16px 9px repeat-x; }
    .receipt-paper::after { bottom: 0; background: radial-gradient(circle at 8px 9px, #f3ede3 7px, transparent 7.5px) 0 0 / 16px 9px repeat-x; }
    .receipt-heading { padding: 3px 0 10px; border-bottom: 1px solid #cfc2b3; text-align: center; }
    .receipt-brand { color: #a87570; font-size: 10px; font-weight: 700; letter-spacing: 1.7px; }
    .receipt-heading h1 { margin: 4px 0 2px; color: #41352b; font: 500 21px/1.25 "Playfair Display", Georgia, serif; }
    .receipt-heading p { margin: 0; color: #897a69; font: italic 12px/1.4 "Playfair Display", Georgia, serif; }
    .receipt-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 7px 10px; padding: 11px 0; border-bottom: 1px dashed #cfc2b3; }
    .receipt-meta__field { min-width: 0; }
    .receipt-meta__field--wide { grid-column: 1 / -1; }
    .receipt-meta__field span, .receipt-section > span { display: block; color: #897a69; font-size: 10px; }
    .receipt-meta__field strong { display: block; overflow-wrap: anywhere; color: #493d32; font-size: 11px; font-weight: 600; }
    .receipt-items { padding: 7px 0; border-bottom: 1px dashed #cfc2b3; }
    .receipt-items__heading, .receipt-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .receipt-items__heading { padding-bottom: 5px; border-bottom: 1px solid #ded5c9; color: #897a69; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .receipt-item { padding: 7px 0; border-bottom: 1px dotted #e4dbd0; font-size: 11px; }
    .receipt-item:last-child { border-bottom: 0; }
    .receipt-item__details { display: grid; min-width: 0; gap: 2px; }
    .receipt-item__details strong { overflow-wrap: anywhere; color: #493d32; font-weight: 600; }
    .receipt-item__details span { color: #897a69; font-size: 10px; }
    .receipt-item > strong { flex: 0 0 auto; color: #493d32; font-size: 11px; }
    .receipt-totals { padding: 9px 0; border-bottom: 1px dashed #cfc2b3; }
    .receipt-total-row { display: flex; justify-content: space-between; gap: 12px; margin: 4px 0; font-size: 11px; }
    .receipt-total-row--grand { margin-top: 7px; padding-top: 7px; border-top: 1px solid #cfc2b3; color: #352b23; font-size: 15px; font-weight: 700; }
    .receipt-section { padding: 9px 0; border-bottom: 1px dashed #cfc2b3; }
    .receipt-section > strong { display: block; margin-top: 2px; color: #493d32; font-size: 11px; }
    .receipt-section p { margin: 3px 0 0; color: #75685b; font-size: 10px; line-height: 1.45; overflow-wrap: anywhere; }
    .receipt-thanks { margin: 12px 0 2px; color: #685642; font: italic 13px/1.5 "Playfair Display", Georgia, serif; text-align: center; }
    @media (max-width: 360px) { .receipt-paper { padding-right: 15px; padding-left: 15px; } }
    @media print { .receipt-page { min-height: 100vh; padding: 0; background: #fff; } .receipt-paper { width: 76mm; box-shadow: none; } }
  </style>
</head>
<body class="receipt-page">
  <main class="receipt-paper">
    <header class="receipt-heading">
      <span class="receipt-brand">FAYZO CROCHET CO.</span>
      <h1>Order Receipt</h1>
      <p>Thank you for choosing handmade ♡</p>
    </header>
    <section class="receipt-meta">
      <div class="receipt-meta__field"><span>Receipt reference</span><strong>${escapeHtml(receipt.receiptNumber)}</strong></div>
      <div class="receipt-meta__field"><span>Order date</span><strong>${escapeHtml(formatReceiptDate(receipt.orderDate))}</strong></div>
      <div class="receipt-meta__field"><span>Customer</span><strong>${escapeHtml(receipt.customerName)}</strong></div>
      <div class="receipt-meta__field"><span>Phone</span><strong>${escapeHtml(receipt.phone)}</strong></div>
      <div class="receipt-meta__field receipt-meta__field--wide"><span>Delivery address</span><strong>${escapeHtml(receipt.address)}, ${escapeHtml(receipt.pincode)}</strong></div>
    </section>
    <section class="receipt-items">
      <div class="receipt-items__heading"><span>Item</span><span>Amount</span></div>
      ${itemsMarkup}
    </section>
    <section class="receipt-totals">
      <div class="receipt-total-row"><span>Subtotal</span><span>₹${Number(receipt.totalAmount).toFixed(2)}</span></div>
      <div class="receipt-total-row receipt-total-row--grand"><span>Total</span><span>₹${Number(receipt.totalAmount).toFixed(2)}</span></div>
    </section>
    <section class="receipt-section">
      <span>Payment method</span>
      <strong>${escapeHtml(receipt.paymentMethod)}</strong>
      <p>${escapeHtml(paymentNote)}</p>
    </section>
    ${notesMarkup}
    <p class="receipt-thanks">Your order is confirmed. We’ll be in touch soon about your handmade treasures.</p>
  </main>
</body>
</html>`;
  const receiptFile = new Blob([receiptHtml], {
    type: "text/html;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(receiptFile);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = `fayzo-receipt-${receipt.receiptNumber}.html`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  authToken,
  currentUser,
  totalAmount,
  onOrderSuccess,
}) {
  const [formData, setFormData] = useState({
    ...initialFormData,
    customerName: currentUser?.name || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    pincode: currentUser?.pincode || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [upiReference, setUpiReference] = useState("");
  const [paymentUtr, setPaymentUtr] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData(initialFormData);
    setErrorMessage("");
    setOrderPlaced(false);
    setReceipt(null);
    setUpiReference("");
    setPaymentUtr("");
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (name === "paymentMethod") {
      setUpiReference("");
      setPaymentUtr("");
    }
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.paymentMethod === "UPI / GPay" && !upiReference) {
      setUpiReference(`FAY${Date.now().toString(36).toUpperCase()}`);
      setErrorMessage("");
      return;
    }

    if (formData.paymentMethod === "UPI / GPay" && !paymentUtr.trim()) {
      setErrorMessage("Enter the UPI transaction ID (UTR) from your payment app.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const orderPayload = {
      ...formData,
      customerEmail: currentUser?.email,
      paymentReference:
        formData.paymentMethod === "UPI / GPay" ? paymentUtr.trim() : null,
      totalAmount: Number(totalAmount),
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.qty,
      })),
      orderDate: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.error ||
            "We couldn't place your order. Please try again in a moment.",
        );
      }

      let savedOrder = {};
      const responseBody = await response.text();
      if (responseBody) {
        try {
          savedOrder = JSON.parse(responseBody);
        } catch (error) {
          console.error("Could not read the created order ID:", error);
        }
      }

      const orderId = savedOrder.id ?? savedOrder.orderId ?? null;
      const completedOrder = {
        ...orderPayload,
        orderId,
        paymentStatus:
          savedOrder.paymentStatus ||
          (formData.paymentMethod === "UPI / GPay" ? "PENDING" : "NOT_REQUIRED"),
        receiptNumber: `FAY-${Date.now().toString(36).toUpperCase()}`,
      };
      setReceipt(completedOrder);
      onOrderSuccess(completedOrder);
      setOrderPlaced(true);
    } catch (error) {
      console.error("Order submission failed:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiPaymentUri = upiReference
    ? createUpiPaymentUri(totalAmount, upiReference)
    : "";

  return (
    <div
      className="checkout-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        className={`checkout-modal${orderPlaced ? " checkout-modal--receipt" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {orderPlaced ? (
          <div className="order-receipt-wrap">
            <header className="order-receipt__heading">
              <span className="eyebrow">FAYZO CROCHET CO.</span>
              <h2 id="checkout-title">Order receipt</h2>
              <p>Thank you for choosing handmade ♡</p>
            </header>

            <div className="order-receipt__meta">
              <div>
                <span>Receipt reference</span>
                <strong>{receipt.receiptNumber}</strong>
              </div>
              <div>
                <span>Order date</span>
                <strong>{formatReceiptDate(receipt.orderDate)}</strong>
              </div>
              <div>
                <span>Customer</span>
                <strong>{receipt.customerName}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{receipt.phone}</strong>
              </div>
              <div className="order-receipt__address">
                <span>Delivery address</span>
                <strong>
                  {receipt.address}, {receipt.pincode}
                </strong>
              </div>
            </div>

            <div className="order-receipt__items">
              <div className="order-receipt__items-heading">
                <span>Item</span>
                <span>Amount</span>
              </div>
              {receipt.items.map((item) => (
                <div className="order-receipt__item" key={item.productId}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.quantity} × ₹{item.price.toFixed(2)}
                    </span>
                  </div>
                  <strong>₹{(item.quantity * item.price).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="order-receipt__totals">
              <div>
                <span>Subtotal</span>
                <span>₹{receipt.totalAmount.toFixed(2)}</span>
              </div>
              <div className="order-receipt__grand-total">
                <strong>Order total</strong>
                <strong>₹{receipt.totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            <div className="order-receipt__payment">
              <span>Payment method</span>
              <strong>{receipt.paymentMethod}</strong>
              <p>
                {receipt.paymentMethod === "Cash on Delivery"
                  ? "Payment is due when your order is delivered."
                  : receipt.paymentStatus === "PAID"
                    ? "UPI payment verified."
                    : `UPI payment is awaiting manual verification. Transaction ID: ${receipt.paymentReference || "not provided"}.`}
              </p>
            </div>

            {receipt.customNotes && (
              <div className="order-receipt__notes">
                <span>Customization notes</span>
                <p>{receipt.customNotes}</p>
              </div>
            )}

            <p className="order-receipt__thanks">
              {receipt.paymentMethod === "Cash on Delivery"
                ? "Your order is confirmed. We’ll be in touch soon about your handmade treasures."
                : "Your order is received. UPI payment will be verified before we begin making your treasures."}
            </p>
            <Link
              className="order-receipt__track-link"
              to="/track"
              onClick={handleClose}
            >
              Track Your Order Now →
            </Link>
            <div className="order-receipt__actions">
              <button
                className="checkout-print-button"
                type="button"
                onClick={() => downloadReceipt(receipt)}
              >
                Download receipt
              </button>
              <button className="checkout-submit" onClick={handleClose}>
                Continue browsing
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="checkout-modal__header">
              <div>
                <span className="eyebrow">HANDMADE DELIVERY</span>
                <h2 id="checkout-title">Shipping details</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={handleClose}
                aria-label="Close checkout"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <div className="checkout-summary">
              <span>Items ({cart.reduce((sum, item) => sum + item.qty, 0)})</span>
              <strong>₹{totalAmount}</strong>
            </div>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <label className="checkout-field">
                <span>Full name <b>*</b></span>
                <input
                  type="text"
                  name="customerName"
                  autoComplete="name"
                  placeholder="e.g. Ananya Sharma"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="checkout-field">
                <span>WhatsApp / phone number <b>*</b></span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="checkout-field">
                <span>Delivery address <b>*</b></span>
                <textarea
                  name="address"
                  autoComplete="street-address"
                  rows="2"
                  placeholder="House / flat, street, landmark, city"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="checkout-field">
                <span>PIN code <b>*</b></span>
                <input
                  type="text"
                  name="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  placeholder="6-digit PIN code"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="checkout-field">
                <span>
                  Customization notes <small>(optional)</small>
                </span>
                <textarea
                  name="customNotes"
                  rows="2"
                  placeholder="Any colors or little details you'd like?"
                  value={formData.customNotes}
                  onChange={handleChange}
                />
              </label>

              <fieldset className="checkout-payment">
                <legend>Payment method</legend>
                {["UPI / GPay", "Cash on Delivery"].map((method) => (
                  <label
                    className={`checkout-payment__option${formData.paymentMethod === method ? " checkout-payment__option--selected" : ""}`}
                    key={method}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={formData.paymentMethod === method}
                      onChange={handleChange}
                    />
                    <span className="checkout-payment__radio" />
                    {method}
                  </label>
                ))}
              </fieldset>

              {formData.paymentMethod === "UPI / GPay" && (
                <section className="checkout-upi" aria-labelledby="upi-payment-title">
                  <h3 id="upi-payment-title">Pay securely with your UPI app</h3>
                  {!upiReference ? (
                    <p>
                      Continue to generate a QR code for ₹{Number(totalAmount).toFixed(2)}.
                    </p>
                  ) : (
                    <>
                      <p>
                        Scan with GPay or another UPI app, or open the payment app on
                        this device. Payee: <strong>{UPI_PAYEE_NAME}</strong>
                      </p>
                      <div className="checkout-upi__payment">
                        <QRCodeSVG
                          aria-label={`UPI payment QR for ₹${Number(totalAmount).toFixed(2)}`}
                          value={upiPaymentUri}
                          size={176}
                          level="M"
                        />
                        <div>
                          <span>UPI ID</span>
                          <strong>{UPI_ID}</strong>
                          <span>Amount</span>
                          <strong>₹{Number(totalAmount).toFixed(2)}</strong>
                          <span>Order reference</span>
                          <strong>{upiReference}</strong>
                          <a className="checkout-upi__open" href={upiPaymentUri}>
                            Open UPI app
                          </a>
                        </div>
                      </div>
                      <label className="checkout-field">
                        <span>UPI transaction ID / UTR <b>*</b></span>
                        <input
                          autoComplete="off"
                          maxLength="100"
                          name="paymentUtr"
                          onChange={(event) => {
                            setPaymentUtr(event.target.value);
                            setErrorMessage("");
                          }}
                          placeholder="Enter the UTR from your payment receipt"
                          required
                          value={paymentUtr}
                        />
                      </label>
                      <p className="checkout-upi__notice">
                        Your order stays pending until we manually verify the transfer.
                        This page cannot confirm payment automatically.
                      </p>
                    </>
                  )}
                </section>
              )}

              {errorMessage && (
                <p className="checkout-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                className="checkout-submit"
                type="submit"
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting
                  ? "Submitting..."
                  : formData.paymentMethod === "UPI / GPay" && !upiReference
                    ? `Continue to UPI payment · ₹${totalAmount}`
                    : formData.paymentMethod === "UPI / GPay"
                      ? "I’ve paid — submit order"
                      : `Place order · ₹${totalAmount}`}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}