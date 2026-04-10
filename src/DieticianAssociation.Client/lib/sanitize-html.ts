/**
 * Sanitizes an HTML string using DOMPurify, safe for both SSR and browser.
 * The require is intentionally lazy so DOMPurify (which accesses window/document
 * at import time) is never loaded during Next.js server-side rendering.
 * Returns an empty string when called on the server.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") return ""
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify")
  return DOMPurify.sanitize(dirty)
}
