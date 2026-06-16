/** Resolve API-relative paths (e.g. `/uploads/...`) for `<img src>`. */
export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}${path}` : path;
}
