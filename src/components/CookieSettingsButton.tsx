"use client";

/**
 * Footer "Cookie settings" control — lets visitors change or *withdraw*
 * cookie consent (GDPR wants withdrawal to be as easy as granting it).
 *
 * Clears the stored choice and reload so the ConsentBanner reappears with
 * fresh Accept/Decline buttons; the root layout's consent-mode default
 * (denied) re-applies on the next load, so ads/analytics stay off until a
 * new choice is made. Also flips the live consent signal to denied first,
 * so running tags stop before the reload completes.
 */
export default function CookieSettingsButton() {
  const reopenBanner = () => {
    try {
      window.localStorage.removeItem("devbench-consent");
    } catch {
      /* storage disabled — the reload alone still reopens the banner */
    }
    const w = window as unknown as {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    const deny = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    };
    if (typeof w.gtag === "function") {
      w.gtag("consent", "update", deny);
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push(["consent", "update", deny]);
    }
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={reopenBanner}
      className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      Cookie settings
    </button>
  );
}
