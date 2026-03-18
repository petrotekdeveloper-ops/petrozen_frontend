import { Helmet } from "react-helmet-async";

function stripHtml(input) {
  return String(input || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function clamp(input, maxLen) {
  const value = stripHtml(input);
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen - 1).trim()}…`;
}

function normalizeBaseUrl(input) {
  const raw = String(input || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

function cleanCanonical({ override, siteBase, currentHref }) {
  const raw = String(override || "").trim();
  const base = normalizeBaseUrl(siteBase) || (currentHref ? new URL(currentHref).origin : "");

  if (!raw) {
    if (!currentHref) return "";
    const u = new URL(currentHref);
    u.hash = "";
    u.search = "";
    if (base) u.host = new URL(base).host, u.protocol = new URL(base).protocol;
    return u.toString();
  }

  try {
    const u = new URL(raw, base || undefined);
    u.hash = "";
    u.search = "";
    if (base) {
      const b = new URL(base);
      u.protocol = b.protocol;
      u.host = b.host;
    }
    return u.toString();
  } catch {
    return "";
  }
}

export default function SeoHead({
  seo,
  fallbackTitle,
  fallbackDescription,
  fallbackKeywords = "",
  canonicalUrl,
  ogImage,
}) {
  const bodyExcerpt =
    typeof window !== "undefined" && typeof document !== "undefined"
      ? clamp(document.body?.innerText || "", 150)
      : "";
  const resolvedTitle = clamp(
    seo?.metaTitle || fallbackTitle || "Petrozen",
    60
  );
  const resolvedDescription = clamp(
    seo?.metaDescription ||
      fallbackDescription ||
      bodyExcerpt ||
      "Industrial solutions and oilfield support from Petrozen.",
    160
  );
  const resolvedKeywords = stripHtml(seo?.metaKeywords || fallbackKeywords || "");
  const siteBase =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_SITE_URL
      : "";
  const currentHref =
    typeof window !== "undefined" ? window.location.href : "";
  const resolvedCanonical = cleanCanonical({
    override: canonicalUrl,
    siteBase,
    currentHref,
  });

  return (
    <Helmet prioritizeSeoTags>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {resolvedKeywords ? (
        <meta name="keywords" content={resolvedKeywords} />
      ) : null}
      {resolvedCanonical ? (
        <link rel="canonical" href={resolvedCanonical} />
      ) : null}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      {resolvedCanonical ? <meta property="og:url" content={resolvedCanonical} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}

      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
    </Helmet>
  );
}

