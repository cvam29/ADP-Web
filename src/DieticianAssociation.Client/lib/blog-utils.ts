/**
 * Utility functions for handling blog URLs and slugs
 */

/**
 * Generates a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @param maxLength - Maximum length of the slug (default: 100)
 * @returns A URL-friendly slug
 */
export function generateSlug(title: string, maxLength: number = 100): string {
  if (!title) return ''

  // Normalize to lowercase and trim
  let slug = title.toLowerCase().trim()

  // Replace any sequence of non-alphanumeric characters with a single hyphen
  // This covers spaces and punctuation in one step
  slug = slug.replace(/[^a-z0-9]+/g, '-')

  // Collapse multiple hyphens and trim edge hyphens
  slug = slug.replace(/-+/g, '-')
  slug = slug.replace(/^-+|-+$/g, '')

  // Truncate and ensure it doesn't end with a hyphen
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-+$/, '')
  }

  return slug
}

/**
 * Creates a blog post URL from either a URL slug or title
 * @param post - Blog post object with url, title, and id
 * @returns The URL path for the blog post
 */
export function getBlogPostUrl(post: { url?: string; title?: string; id: string }): string {
  if (post.url) {
    return `/blog/${post.url}`
  }
  
  if (post.title) {
    const slug = generateSlug(post.title)
    return `/blog/${slug || post.id}`
  }
  
  return `/blog/${post.id}`
}

/**
 * Validates if a string is a valid URL slug
 * @param slug - The slug to validate
 * @returns True if the slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false

  // Single-pass validation: lowercase letters, numbers, hyphens, no edge hyphens, no consecutive hyphens
  const slugRegex = /^(?!-)(?!.*--)[a-z0-9-]+(?<!-)$/
  return slugRegex.test(slug)
}

/**
 * Extracts the slug from a blog URL path
 * @param path - The URL path (e.g., '/blog/my-post-slug')
 * @returns The slug or null if invalid
 */
export function extractSlugFromPath(path: string): string | null {
  const match = path.match(/^\/blog\/([^\/]+)$/)
  return match ? match[1] : null
}
