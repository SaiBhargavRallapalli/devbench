/**
 * Down Detector service catalog — shared by the client UI and the
 * /api/down-check route. The route ONLY probes hostnames listed here
 * (exact match), which is what makes the endpoint SSRF-safe: there is
 * no open-proxy surface, just a fixed list of well-known public sites.
 *
 * Indian services are listed first inside each category, then worldwide
 * ones — the tool's primary audience is checking "is Jio/Swiggy/IRCTC
 * down?" alongside the global giants.
 */

export type ServiceRegion = "IN" | "world";

export type ServiceCategoryId =
  | "telecom"
  | "social"
  | "streaming"
  | "food"
  | "shopping"
  | "banking"
  | "travel"
  | "government"
  | "cloud"
  | "gaming";

export interface ServiceDef {
  /** Stable id used in URLs/state. */
  id: string;
  /** Display name. */
  name: string;
  /** Exact hostname probed over HTTPS. */
  host: string;
  category: ServiceCategoryId;
  region: ServiceRegion;
}

export interface ServiceCategory {
  id: ServiceCategoryId;
  label: string;
}

export const DOWN_CHECK_CATEGORIES: ServiceCategory[] = [
  { id: "telecom", label: "Telecom & ISP" },
  { id: "social", label: "Social & Messaging" },
  { id: "streaming", label: "Streaming" },
  { id: "food", label: "Food & Grocery" },
  { id: "shopping", label: "Shopping" },
  { id: "banking", label: "Banking & Payments" },
  { id: "travel", label: "Travel & Transport" },
  { id: "government", label: "Government" },
  { id: "cloud", label: "Cloud, Dev & AI" },
  { id: "gaming", label: "Gaming" },
];

export const DOWN_CHECK_SERVICES: ServiceDef[] = [
  // ── Telecom & ISP (India) ────────────────────────────────────────
  { id: "jio", name: "Jio", host: "www.jio.com", category: "telecom", region: "IN" },
  { id: "airtel", name: "Airtel", host: "www.airtel.in", category: "telecom", region: "IN" },
  { id: "vi", name: "Vi (Vodafone Idea)", host: "www.myvi.in", category: "telecom", region: "IN" },
  { id: "bsnl", name: "BSNL", host: "www.bsnl.co.in", category: "telecom", region: "IN" },
  { id: "act-fibernet", name: "ACT Fibernet", host: "actcorp.in", category: "telecom", region: "IN" },
  { id: "tata-play", name: "Tata Play", host: "www.tataplay.com", category: "telecom", region: "IN" },
  { id: "hathway", name: "Hathway", host: "www.hathway.com", category: "telecom", region: "IN" },

  // ── Social & Messaging ───────────────────────────────────────────
  { id: "truecaller", name: "Truecaller", host: "www.truecaller.com", category: "social", region: "IN" },
  { id: "sharechat", name: "ShareChat", host: "www.sharechat.com", category: "social", region: "IN" },
  { id: "whatsapp", name: "WhatsApp", host: "www.whatsapp.com", category: "social", region: "world" },
  { id: "instagram", name: "Instagram", host: "www.instagram.com", category: "social", region: "world" },
  { id: "facebook", name: "Facebook", host: "www.facebook.com", category: "social", region: "world" },
  { id: "x", name: "X (Twitter)", host: "x.com", category: "social", region: "world" },
  { id: "youtube", name: "YouTube", host: "www.youtube.com", category: "social", region: "world" },
  { id: "telegram", name: "Telegram", host: "www.telegram.org", category: "social", region: "world" },
  { id: "snapchat", name: "Snapchat", host: "www.snapchat.com", category: "social", region: "world" },
  { id: "linkedin", name: "LinkedIn", host: "www.linkedin.com", category: "social", region: "world" },
  { id: "reddit", name: "Reddit", host: "www.reddit.com", category: "social", region: "world" },
  { id: "discord", name: "Discord", host: "discord.com", category: "social", region: "world" },
  { id: "pinterest", name: "Pinterest", host: "www.pinterest.com", category: "social", region: "world" },
  { id: "threads", name: "Threads", host: "www.threads.net", category: "social", region: "world" },

  // ── Streaming & Entertainment ────────────────────────────────────
  { id: "hotstar", name: "Disney+ Hotstar", host: "www.hotstar.com", category: "streaming", region: "IN" },
  { id: "jiocinema", name: "JioCinema", host: "www.jiocinema.com", category: "streaming", region: "IN" },
  { id: "zee5", name: "ZEE5", host: "www.zee5.com", category: "streaming", region: "IN" },
  { id: "sonyliv", name: "SonyLIV", host: "www.sonyliv.com", category: "streaming", region: "IN" },
  { id: "jiosaavn", name: "JioSaavn", host: "www.jiosaavn.com", category: "streaming", region: "IN" },
  { id: "sunnxt", name: "Sun NXT", host: "www.sunnxt.com", category: "streaming", region: "IN" },
  { id: "mx-player", name: "MX Player", host: "www.mxplayer.in", category: "streaming", region: "IN" },
  { id: "netflix", name: "Netflix", host: "www.netflix.com", category: "streaming", region: "world" },
  { id: "prime-video", name: "Amazon Prime Video", host: "www.primevideo.com", category: "streaming", region: "world" },
  { id: "spotify", name: "Spotify", host: "www.spotify.com", category: "streaming", region: "world" },
  { id: "youtube-music", name: "YouTube Music", host: "music.youtube.com", category: "streaming", region: "world" },

  // ── Food & Grocery ───────────────────────────────────────────────
  { id: "swiggy", name: "Swiggy", host: "www.swiggy.com", category: "food", region: "IN" },
  { id: "zomato", name: "Zomato", host: "www.zomato.com", category: "food", region: "IN" },
  { id: "blinkit", name: "Blinkit", host: "www.blinkit.com", category: "food", region: "IN" },
  { id: "zepto", name: "Zepto", host: "www.zepto.com", category: "food", region: "IN" },
  { id: "bigbasket", name: "BigBasket", host: "www.bigbasket.com", category: "food", region: "IN" },
  { id: "dominos-india", name: "Domino's India", host: "www.dominos.co.in", category: "food", region: "IN" },
  { id: "licious", name: "Licious", host: "www.licious.in", category: "food", region: "IN" },

  // ── Shopping & E-commerce ────────────────────────────────────────
  { id: "flipkart", name: "Flipkart", host: "www.flipkart.com", category: "shopping", region: "IN" },
  { id: "amazon-in", name: "Amazon India", host: "www.amazon.in", category: "shopping", region: "IN" },
  { id: "myntra", name: "Myntra", host: "www.myntra.com", category: "shopping", region: "IN" },
  { id: "ajio", name: "AJIO", host: "www.ajio.com", category: "shopping", region: "IN" },
  { id: "nykaa", name: "Nykaa", host: "www.nykaa.com", category: "shopping", region: "IN" },
  { id: "meesho", name: "Meesho", host: "www.meesho.com", category: "shopping", region: "IN" },
  { id: "jiomart", name: "JioMart", host: "www.jiomart.com", category: "shopping", region: "IN" },
  { id: "snapdeal", name: "Snapdeal", host: "www.snapdeal.com", category: "shopping", region: "IN" },
  { id: "tata-cliq", name: "Tata CLiQ", host: "www.tatacliq.com", category: "shopping", region: "IN" },
  { id: "croma", name: "Croma", host: "www.croma.com", category: "shopping", region: "IN" },
  { id: "amazon", name: "Amazon", host: "www.amazon.com", category: "shopping", region: "world" },

  // ── Banking & Payments ───────────────────────────────────────────
  { id: "sbi", name: "State Bank of India", host: "www.sbi.co.in", category: "banking", region: "IN" },
  { id: "hdfc-bank", name: "HDFC Bank", host: "www.hdfcbank.com", category: "banking", region: "IN" },
  { id: "icici-bank", name: "ICICI Bank", host: "www.icicibank.com", category: "banking", region: "IN" },
  { id: "axis-bank", name: "Axis Bank", host: "www.axisbank.com", category: "banking", region: "IN" },
  { id: "kotak-bank", name: "Kotak Bank", host: "www.kotak.com", category: "banking", region: "IN" },
  { id: "bank-of-baroda", name: "Bank of Baroda", host: "www.bankofbaroda.in", category: "banking", region: "IN" },
  { id: "paytm", name: "Paytm", host: "www.paytm.com", category: "banking", region: "IN" },
  { id: "phonepe", name: "PhonePe", host: "www.phonepe.com", category: "banking", region: "IN" },
  { id: "cred", name: "CRED", host: "www.cred.club", category: "banking", region: "IN" },
  { id: "razorpay", name: "Razorpay", host: "www.razorpay.com", category: "banking", region: "IN" },
  { id: "google-pay", name: "Google Pay", host: "pay.google.com", category: "banking", region: "world" },

  // ── Travel & Transport ───────────────────────────────────────────
  { id: "irctc", name: "IRCTC", host: "www.irctc.co.in", category: "travel", region: "IN" },
  { id: "makemytrip", name: "MakeMyTrip", host: "www.makemytrip.com", category: "travel", region: "IN" },
  { id: "goibibo", name: "Goibibo", host: "www.goibibo.com", category: "travel", region: "IN" },
  { id: "cleartrip", name: "Cleartrip", host: "www.cleartrip.com", category: "travel", region: "IN" },
  { id: "redbus", name: "redBus", host: "www.redbus.in", category: "travel", region: "IN" },
  { id: "ola", name: "Ola", host: "www.olacabs.com", category: "travel", region: "IN" },
  { id: "rapido", name: "Rapido", host: "www.rapido.bike", category: "travel", region: "IN" },
  { id: "indigo", name: "IndiGo", host: "www.indigo.in", category: "travel", region: "IN" },
  { id: "uber", name: "Uber", host: "www.uber.com", category: "travel", region: "world" },
  { id: "google-maps", name: "Google Maps", host: "maps.google.com", category: "travel", region: "world" },

  // ── Government (India) ───────────────────────────────────────────
  { id: "uidai", name: "Aadhaar (UIDAI)", host: "uidai.gov.in", category: "government", region: "IN" },
  { id: "digilocker", name: "DigiLocker", host: "www.digilocker.gov.in", category: "government", region: "IN" },
  { id: "income-tax", name: "Income Tax Portal", host: "www.incometax.gov.in", category: "government", region: "IN" },
  { id: "epfo", name: "EPFO", host: "www.epfindia.gov.in", category: "government", region: "IN" },
  { id: "parivahan", name: "Parivahan", host: "parivahan.gov.in", category: "government", region: "IN" },

  // ── Cloud, Dev & AI ──────────────────────────────────────────────
  { id: "github", name: "GitHub", host: "github.com", category: "cloud", region: "world" },
  { id: "cloudflare", name: "Cloudflare", host: "www.cloudflare.com", category: "cloud", region: "world" },
  { id: "aws", name: "Amazon Web Services", host: "aws.amazon.com", category: "cloud", region: "world" },
  { id: "azure", name: "Microsoft Azure", host: "azure.microsoft.com", category: "cloud", region: "world" },
  { id: "google-cloud", name: "Google Cloud", host: "cloud.google.com", category: "cloud", region: "world" },
  { id: "vercel", name: "Vercel", host: "vercel.com", category: "cloud", region: "world" },
  { id: "npm", name: "npm", host: "www.npmjs.com", category: "cloud", region: "world" },
  { id: "stackoverflow", name: "Stack Overflow", host: "stackoverflow.com", category: "cloud", region: "world" },
  { id: "google", name: "Google", host: "www.google.com", category: "cloud", region: "world" },
  { id: "gmail", name: "Gmail", host: "mail.google.com", category: "cloud", region: "world" },
  { id: "outlook", name: "Outlook", host: "outlook.live.com", category: "cloud", region: "world" },
  { id: "microsoft-365", name: "Microsoft 365", host: "www.office.com", category: "cloud", region: "world" },
  { id: "openai", name: "ChatGPT (OpenAI)", host: "chatgpt.com", category: "cloud", region: "world" },
  { id: "claude", name: "Claude", host: "claude.ai", category: "cloud", region: "world" },
  { id: "gemini", name: "Google Gemini", host: "gemini.google.com", category: "cloud", region: "world" },
  { id: "zoom", name: "Zoom", host: "zoom.us", category: "cloud", region: "world" },
  { id: "slack", name: "Slack", host: "slack.com", category: "cloud", region: "world" },
  { id: "notion", name: "Notion", host: "www.notion.so", category: "cloud", region: "world" },
  { id: "figma", name: "Figma", host: "www.figma.com", category: "cloud", region: "world" },
  { id: "canva", name: "Canva", host: "www.canva.com", category: "cloud", region: "world" },
  { id: "dropbox", name: "Dropbox", host: "www.dropbox.com", category: "cloud", region: "world" },
  { id: "stripe", name: "Stripe", host: "stripe.com", category: "cloud", region: "world" },
  { id: "shopify", name: "Shopify", host: "www.shopify.com", category: "cloud", region: "world" },

  // ── Gaming ───────────────────────────────────────────────────────
  { id: "bgmi", name: "BGMI (Battlegrounds Mobile India)", host: "www.battlegroundsmobileindia.com", category: "gaming", region: "IN" },
  { id: "free-fire", name: "Free Fire", host: "ff.garena.com", category: "gaming", region: "IN" },
  { id: "steam", name: "Steam", host: "store.steampowered.com", category: "gaming", region: "world" },
  { id: "epic-games", name: "Epic Games", host: "www.epicgames.com", category: "gaming", region: "world" },
  { id: "roblox", name: "Roblox", host: "www.roblox.com", category: "gaming", region: "world" },
  { id: "valorant", name: "Valorant", host: "playvalorant.com", category: "gaming", region: "world" },
  { id: "xbox", name: "Xbox", host: "www.xbox.com", category: "gaming", region: "world" },
  { id: "playstation", name: "PlayStation", host: "www.playstation.com", category: "gaming", region: "world" },
  { id: "twitch", name: "Twitch", host: "www.twitch.tv", category: "gaming", region: "world" },
];

/** Exact hostnames the API is allowed to probe (server-side validation). */
export const DOWN_CHECK_HOSTS: ReadonlySet<string> = new Set(
  DOWN_CHECK_SERVICES.map((s) => s.host),
);

export const serviceByHost = new Map<string, ServiceDef>(
  DOWN_CHECK_SERVICES.map((s) => [s.host, s]),
);

/** Favicon source — DuckDuckGo's icon service (no cookies, CORS-free <img>). */
export function faviconUrl(host: string): string {
  return `https://icons.duckduckgo.com/ip3/${host}.ico`;
}
