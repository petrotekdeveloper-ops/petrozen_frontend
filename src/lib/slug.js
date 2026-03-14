export function toSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || "").trim());
}

export function matchesSlugOrId(routePart, item) {
  const raw = String(routePart || "").trim();
  if (!raw || !item) return false;

  const itemId = String(item._id || "").trim();
  if (itemId && raw === itemId) return true;

  const titleSlug = toSlug(item.title || item.name || "");
  return titleSlug && raw.toLowerCase() === titleSlug;
}
