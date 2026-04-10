/**
 * Returns true only for same-origin relative paths (starting with /).
 * Rejects protocol-relative URLs (//evil.com), absolute external URLs,
 * and data:/javascript: URIs to prevent open-redirect and XSS.
 */
export function isSafeRedirect(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false
  // Reject protocol-relative URLs (e.g. //attacker.com)
  if (url.startsWith("//")) return false
  // Reject any URL that has a scheme (http:, https:, javascript:, data:, etc.)
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/i.test(url)) return false
  // Only allow relative paths starting with /
  return url.startsWith("/")
}

/**
 * Returns `url` if it is a safe same-origin path, otherwise returns `fallback`.
 */
export function getSafeRedirect(
  url: string | null | undefined,
  fallback: string
): string {
  return isSafeRedirect(url) ? (url as string) : fallback
}
