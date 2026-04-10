#!/usr/bin/env node
import fs from "fs/promises"
import path from "path"

function parseArgs() {
  const argv = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith("--")) continue
    if (a.includes("=")) {
      const [k, v] = a.split("=")
      out[k.replace(/^--/, "")] = v
    } else {
      const key = a.replace(/^--/, "")
      const val = argv[i + 1]
      out[key] = val
      i++
    }
  }
  return out
}

const args = parseArgs()

function isLocalHostCandidate(u) {
  if (!u) return false
  try {
    return /localhost|127\.0\.0\.1/.test(String(u))
  } catch (e) {
    return false
  }
}

// Resolve API base URL. Never fall back to a localhost URL — prefer production defaults.
const prodApiDefault = 'https://api-adp.azure-api.net'
let apiCandidate = args.api || process.env.SITEMAP_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || prodApiDefault
if (isLocalHostCandidate(apiCandidate)) {
  console.warn(`Ignoring local API candidate (${apiCandidate}) — using production default`)
  apiCandidate = prodApiDefault
}
const apiBase = String(apiCandidate).replace(/\/+$/, '')

// Resolve site URL. Never use localhost as default.
const prodSiteDefault = 'https://www.adp.org.in'
let siteCandidate = args.site || process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || prodSiteDefault
if (isLocalHostCandidate(siteCandidate)) {
  console.warn(`Ignoring local site candidate (${siteCandidate}) — using production default`)
  siteCandidate = prodSiteDefault
}
const siteUrl = String(siteCandidate).replace(/\/+$/, '')

const enableIndexing = true

console.log(`Sitemap generator using API base: ${apiBase} and site: ${siteUrl} (indexing=${enableIndexing})`)

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

async function fetchJson(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`fetch ${url} -> ${res.status}`)
      return []
    }
    const json = await res.json()
    if (Array.isArray(json)) return json
    if (Array.isArray(json.results)) return json.results
    if (Array.isArray(json.items)) return json.items
    return []
  } catch (err) {
    console.warn(`fetch error ${url}:`, err.message || err)
    return []
  }
}

async function build() {
  const outDir = path.resolve(process.cwd(), "public")
  await fs.mkdir(outDir, { recursive: true })

  const staticRoutes = [
    "/",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/membership",
    "/education",
    "/resources",
    "/blog",
    "/events",
    "/certificates",
  ]

  const urls = new Map()
  const addUrl = (loc, lastmod) => urls.set(loc, { loc, lastmod })

  for (const r of staticRoutes) addUrl(`${siteUrl}${r}`, null)

  // Try to fetch blog slugs
  const blogSlugs = await fetchJson(`${apiBase}/api/blog/slugs`)
  for (const item of blogSlugs) {
    const rawSlug = item.slug || item.url || item.name || item.title || item.id
    const slug = String(rawSlug || '').replace(/^\/+|\/+$/g, '')
    if (!slug) continue
    const loc = `${siteUrl}/blog/${encodeURIComponent(String(slug))}`
    const lastmodRaw = item.modifiedOn || item.updatedAt || item.lastModified || item.publishedOn
    const lastmod = lastmodRaw ? new Date(lastmodRaw).toISOString().split("T")[0] : null
    addUrl(loc, lastmod)
  }

  // Try to fetch event slugs
  const eventSlugs = await fetchJson(`${apiBase}/api/events/slugs`)
  for (const item of eventSlugs) {
    const slug = item.slug || item.url || item.name || item.title || item.id
    if (!slug) continue
    const loc = `${siteUrl}/events/${encodeURIComponent(String(slug))}`
    const lastmodRaw = item.modifiedOn || item.updatedAt || item.lastModified || item.publishedOn
    const lastmod = lastmodRaw ? new Date(lastmodRaw).toISOString().split("T")[0] : null
    addUrl(loc, lastmod)
  }

  // Additional endpoints can be added here if your API provides slugs for resources/education

  const entries = Array.from(urls.values())
    .map(({ loc, lastmod }) => {
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}\n  </url>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`
  const sitemapPath = path.join(outDir, "sitemap.xml")
  await fs.writeFile(sitemapPath, xml, "utf8")
  console.log(`Wrote sitemap: ${sitemapPath} (${entries.length} entries)`)

  // Write robots.txt according to indexing flag
  const robotsPath = path.join(outDir, "robots.txt")
  const robotsContent = enableIndexing
    ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`
  await fs.writeFile(robotsPath, robotsContent, "utf8")
  console.log(`Wrote robots: ${robotsPath} (indexing=${enableIndexing})`)
}

build().catch((err) => {
  console.error("Sitemap generation failed:", err)
  process.exit(1)
})
