import { useState } from "react";
import { useLocation } from "react-router-dom";

const CONTACT_EMAIL = "yarn.diary.studio@gmail.com";
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

export default function Footer({ authToken, currentUser, onOpenAuth }) {
  const isAdminPage = useLocation().pathname === "/admin";
  const [message, setMessage] = useState("");
  const [sendState, setSendState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleMessageSubmit = async (event) => {
    event.preventDefault();
    if (!authToken || !currentUser) {
      onOpenAuth();
      return;
    }

    setSendState("sending");
    setErrorMessage("");

    if (!WEB3FORMS_ACCESS_KEY) {
      setSendState("error");
      setErrorMessage(
        "Email isn't configured for this deployment. Add VITE_WEB3FORMS_ACCESS_KEY to your Vercel environment variables and redeploy. For local development, set it in .env.local and restart Vite.",
      );
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: currentUser.name || currentUser.email,
          email: currentUser.email,
          message,
          subject: `Website message from ${currentUser.name || currentUser.email}`,
          from_name: "Fayzo Crochet Co. website",
        }),
      });
      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ||
            result.body?.message ||
            "Your message could not be sent.",
        );
      }

      setSendState("sent");
      setMessage("");
    } catch (error) {
      setSendState("error");
      setErrorMessage(
        error.name === "AbortError"
          ? "The message service took too long to respond. Please try again."
          : error instanceof TypeError
            ? "Could not reach the message service. Please try again later."
            : error.message,
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  return (
    <footer className="site-footer" id="our-story">
      <div className="site-footer__brand">
        <span aria-hidden="true">🧶</span>
        <div>
          <strong>A little love in every loop.</strong>
          <p>Thoughtfully handmade by Fayzo Crochet Co.</p>
        </div>
      </div>
      <section className="site-footer__contact" aria-labelledby="contact-title">
        <div className="site-footer__contact-info">
          <span className="eyebrow">LET’S KEEP IN TOUCH</span>
          <h2 id="contact-title">Say hello</h2>
          <span className="site-footer__email">{CONTACT_EMAIL}</span>
          <div className="site-footer__socials" aria-label="Social media">
            <a
              href="https://www.instagram.com/fayzocrochet/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://www.threads.net/@fayzocrochet"
              target="_blank"
              rel="noreferrer"
            >
              Threads
            </a>
            <a
              href="https://www.facebook.com/fayzocrochet/"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          </div>
        </div>

        {!isAdminPage && (
          <form
            className="site-footer__message-form"
            onSubmit={handleMessageSubmit}
          >
            {currentUser ? (
              <p className="site-footer__sender">
                Sending as{" "}
                <strong>{currentUser.name || currentUser.email}</strong>
                {currentUser.name && ` (${currentUser.email})`}
              </p>
            ) : (
              <p className="site-footer__sender">
                <button
                  className="site-footer__sign-in"
                  onClick={onOpenAuth}
                  type="button"
                >
                  Sign in
                </button>{" "}
                to send a message using your account details.
              </p>
            )}
            <label className="site-footer__message">
              <span>Message</span>
              <textarea
                name="message"
                onChange={(event) => setMessage(event.target.value)}
                required
                rows="3"
                value={message}
              />
            </label>
            {currentUser && (
              <button disabled={sendState === "sending"} type="submit">
                {sendState === "sending" ? "Sending…" : "Send message"}
                {sendState !== "sending" && <span aria-hidden="true"> →</span>}
              </button>
            )}
            <p aria-live="polite">
              {sendState === "sent"
                ? "Thank you! Your message has been sent."
                : errorMessage ||
                  "Your account name and email will be included with your message."}
            </p>
          </form>
        )}
      </section>
      <span className="site-footer__copyright">
        © {new Date().getFullYear()} Fayzo Crochet Co. Made with ♡
      </span>
    </footer>
  );
}
