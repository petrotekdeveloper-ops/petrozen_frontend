import { Helmet } from "react-helmet-async";

function stripHtml(input) {
  return String(input || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function clamp(input, maxLen) {
  const value = stripHtml(input);
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen - 1).trim()}…`;
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
  const resolvedCanonical = String(
    seo?.canonicalUrl ||
      canonicalUrl ||
      (typeof window !== "undefined" ? window.location.href : "")
  ).trim();

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

