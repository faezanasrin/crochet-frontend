import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { API_BASE_URL } from "../utils/api";

const UPI_ID = "faezanasrinmb@oksbi";
const UPI_PAYEE_NAME = "Fayzo Crochet Co.";

const initialFormData = {
  customerName: "",
  phone: "",
  address: "",
  pincode: "",
  customNotes: "",
  isGiftOrder: false,
  giftRecipientName: "",
  giftRecipientAddress: "",
  giftRecipientPincode: "",
  giftMessage: "",
  paymentMethod: "UPI",
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
  const paymentNote = `${receipt.paymentStatus === "PAID" ? "UPI payment verified." : "UPI payment is awaiting manual verification."} UTR: ${receipt.utrNumber || "not provided"}.`;
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
  const giftMarkup = receipt.isGiftOrder
    ? `<section class="receipt-section"><span>Gift delivery</span><strong>${escapeHtml(receipt.giftRecipientName)}</strong><p>${escapeHtml(receipt.giftRecipientAddress)}, ${escapeHtml(receipt.giftRecipientPincode)}</p><p>Handwritten card: ${escapeHtml(receipt.giftMessage)}</p><p>No invoice or pricing slips will be included in the parcel.</p></section>`
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
      <div class="receipt-meta__field"><span>Customer</span><strong>${escapeHtml(receipt.giftSenderName || receipt.customerName)}</strong></div>
      <div class="receipt-meta__field"><span>Phone</span><strong>${escapeHtml(receipt.phone)}</strong></div>
      <div class="receipt-meta__field receipt-meta__field--wide"><span>Delivery address</span><strong>${escapeHtml(receipt.address)}, ${escapeHtml(receipt.pincode)}</strong></div>
    </section>
    <section class="receipt-items">
      <div class="receipt-items__heading"><span>Item</span><span>Amount</span></div>
      ${itemsMarkup}
    </section>
    ${giftMarkup}
    <section class="receipt-totals">
      <div class="receipt-total-row"><span>Subtotal</span><span>₹${Number(receipt.subtotal).toFixed(2)}</span></div>
      <div class="receipt-total-row"><span>Delivery</span><span>${Number(receipt.deliveryCharge) === 0 ? "FREE" : `₹${Number(receipt.deliveryCharge).toFixed(2)}`}</span></div>
      ${Number(receipt.giftWrapFee) > 0 ? `<div class="receipt-total-row"><span>Gift packaging</span><span>₹${Number(receipt.giftWrapFee).toFixed(2)}</span></div>` : ""}
      <div class="receipt-total-row receipt-total-row--grand"><span>Grand total</span><span>₹${Number(receipt.totalAmount).toFixed(2)}</span></div>
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
  const subtotal = Number(totalAmount);
  const deliveryCharge = subtotal >= 499 ? 0 : 49;
  const giftWrapFee = formData.isGiftOrder ? 150 : 0;
  const grandTotal = subtotal + deliveryCharge + giftWrapFee;
  const amountToFreeDelivery = Math.max(0, 499 - subtotal);

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
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!upiReference) {
      setUpiReference(`FAY${Date.now().toString(36).toUpperCase()}`);
      setErrorMessage("");
      return;
    }

    if (!/^\d{12}$/.test(paymentUtr.trim())) {
      setErrorMessage("Enter the 12-digit UPI reference / UTR from your payment app.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const orderPayload = {
      ...formData,
      customerName: formData.isGiftOrder
        ? formData.giftRecipientName
        : formData.customerName,
      address: formData.isGiftOrder
        ? formData.giftRecipientAddress
        : formData.address,
      pincode: formData.isGiftOrder
        ? formData.giftRecipientPincode
        : formData.pincode,
      giftSenderName: formData.isGiftOrder ? formData.customerName : "",
      giftWrapFee,
      paymentMethod: "UPI",
      customerEmail: currentUser?.email,
      paymentReference: paymentUtr.trim(),
      utrNumber: paymentUtr.trim(),
      subtotal,
      deliveryCharge,
      totalAmount: grandTotal,
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.qty,
      })),
      orderDate: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
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
        subtotal: Number(savedOrder.subtotal ?? subtotal),
        deliveryCharge: Number(savedOrder.deliveryCharge ?? deliveryCharge),
        totalAmount: Number(savedOrder.totalAmount ?? grandTotal),
        utrNumber: savedOrder.utrNumber || paymentUtr.trim(),
        paymentReference:
          savedOrder.paymentReference || paymentUtr.trim(),
        orderId,
        paymentStatus: savedOrder.paymentStatus || "PENDING",
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
    ? createUpiPaymentUri(grandTotal, upiReference)
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
                <strong>{receipt.giftSenderName || receipt.customerName}</strong>
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
            {receipt.isGiftOrder && (
              <div className="order-receipt__gift">
                <span>🎁 Gift for {receipt.giftRecipientName}</span>
                <p>Handwritten card: {receipt.giftMessage}</p>
                <p>No invoice or pricing slips will be included in the parcel.</p>
              </div>
            )}

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
                <span>₹{receipt.subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span>Delivery charge</span>
                <span>
                  {receipt.deliveryCharge === 0
                    ? "FREE ✨"
                    : `₹${receipt.deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              {receipt.giftWrapFee > 0 && (
                <div>
                  <span>Gift packaging</span>
                  <span>₹{receipt.giftWrapFee.toFixed(2)}</span>
                </div>
              )}
              <div className="order-receipt__grand-total">
                <strong>Grand total</strong>
                <strong>₹{receipt.totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            <div className="order-receipt__payment">
              <span>Payment method</span>
              <strong>{receipt.paymentMethod}</strong>
              <p>
                {receipt.paymentStatus === "PAID"
                  ? "UPI payment verified."
                  : `UPI payment is awaiting manual verification. UTR: ${receipt.utrNumber}.`}
              </p>
            </div>

            {receipt.customNotes && (
              <div className="order-receipt__notes">
                <span>Customization notes</span>
                <p>{receipt.customNotes}</p>
              </div>
            )}
            <p className="order-receipt__thanks">
              Your order is received. UPI payment will be verified before we
              begin making your treasures.
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
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </div>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="checkout-totals" aria-label="Order total breakdown">
                <div>
                  <span>Items subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Delivery charge</span>
                  <strong>
                    {deliveryCharge === 0
                      ? "FREE ✨"
                      : `₹${deliveryCharge.toFixed(2)}`}
                  </strong>
                </div>
                {giftWrapFee > 0 && (
                  <div>
                    <span>Gift packaging</span>
                    <strong>₹{giftWrapFee.toFixed(2)}</strong>
                  </div>
                )}
                {amountToFreeDelivery > 0 && (
                  <p className="checkout-delivery-hint">
                    Add ₹{amountToFreeDelivery.toFixed(2)} more to unlock FREE
                    delivery!
                  </p>
                )}
                <div className="checkout-totals__grand">
                  <strong>Grand total payable</strong>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
                </div>
              </div>

              <label className="checkout-field">
                <span>{formData.isGiftOrder ? "Your name" : "Full name"} <b>*</b></span>
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

              <label className="checkout-gift-toggle">
                <input
                  type="checkbox"
                  name="isGiftOrder"
                  checked={formData.isGiftOrder}
                  onChange={(event) => {
                    setFormData((current) => ({
                      ...current,
                      isGiftOrder: event.target.checked,
                    }));
                    setUpiReference("");
                    setPaymentUtr("");
                    setErrorMessage("");
                  }}
                />
                <span>🎁 Sending directly to someone special? (₹150)</span>
              </label>

              {formData.isGiftOrder ? (
                <section className="checkout-gift-fields" aria-label="Gift delivery details">
                  <p>
                    We’ll send the parcel to your recipient, include your
                    handwritten card, and leave out all invoices and pricing
                    slips.
                  </p>
                  <label className="checkout-field">
                    <span>Recipient’s name <b>*</b></span>
                    <input
                      type="text"
                      name="giftRecipientName"
                      autoComplete="off"
                      value={formData.giftRecipientName}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Recipient’s address <b>*</b></span>
                    <textarea
                      name="giftRecipientAddress"
                      autoComplete="off"
                      rows="2"
                      placeholder="House / flat, street, landmark, city"
                      value={formData.giftRecipientAddress}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Recipient’s PIN code <b>*</b></span>
                    <input
                      type="text"
                      name="giftRecipientPincode"
                      inputMode="numeric"
                      autoComplete="off"
                      pattern="[0-9]{6}"
                      maxLength="6"
                      placeholder="6-digit PIN code"
                      value={formData.giftRecipientPincode}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Handwritten card note <b>*</b></span>
                    <textarea
                      name="giftMessage"
                      rows="3"
                      maxLength="300"
                      placeholder="Write a little message for their card..."
                      value={formData.giftMessage}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </section>
              ) : (
                <>
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
                </>
              )}

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

              <section className="checkout-upi" aria-labelledby="upi-payment-title">
                <h3 id="upi-payment-title">Pay with UPI</h3>
                <p>
                  Pay <strong>₹{grandTotal.toFixed(2)}</strong> to{" "}
                  <strong>{UPI_ID}</strong> using Google Pay (GPay), PhonePe,
                  Paytm, or any UPI app. Payee: <strong>{UPI_PAYEE_NAME}</strong>
                </p>
                {!upiReference ? (
                  <p>
                    Continue to display the QR code and open a payment app.
                  </p>
                ) : (
                  <>
                    <div className="checkout-upi__payment">
                      <QRCodeSVG
                        aria-label={`UPI payment QR for ₹${grandTotal.toFixed(2)}`}
                        value={upiPaymentUri}
                        size={176}
                        level="M"
                      />
                      <div>
                        <span>UPI ID</span>
                        <strong>{UPI_ID}</strong>
                        <span>Amount payable</span>
                        <strong>₹{grandTotal.toFixed(2)}</strong>
                        <span>Order reference</span>
                        <strong>{upiReference}</strong>
                        <a className="checkout-upi__open" href={upiPaymentUri}>
                          Open UPI app
                        </a>
                      </div>
                    </div>
                    <label className="checkout-field">
                      <span>12-digit UPI reference / UTR number <b>*</b></span>
                      <input
                        autoComplete="off"
                        inputMode="numeric"
                        maxLength="12"
                        minLength="12"
                        name="paymentUtr"
                        onChange={(event) => {
                          setPaymentUtr(
                            event.target.value.replace(/\D/g, "").slice(0, 12),
                          );
                          setErrorMessage("");
                        }}
                        pattern="[0-9]{12}"
                        placeholder="Enter the 12-digit UTR"
                        required
                        value={paymentUtr}
                      />
                    </label>
                    <p className="checkout-upi__notice">
                      Your order stays pending until we manually verify the
                      payment. Use the 12-digit UTR shown in your payment app.
                    </p>
                  </>
                )}
              </section>

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
                  : !upiReference
                    ? `Continue to UPI payment · ₹${grandTotal.toFixed(2)}`
                    : paymentUtr.length !== 12
                      ? "Enter 12-digit UTR to place order"
                      : `I’ve paid — place order · ₹${grandTotal.toFixed(2)}`}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}