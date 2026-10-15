// Appends every product and published blog post to the static sitemap at request time,
// so new listings are discoverable without a redeploy.
import { sitemapWithEntries } from './lib/seo.js'

export default async function handler(_request, context) {
  const response = await context.next()
  const sitemap = await response.text()
  const base = (Netlify.env.get('API_URL') || Netlify.env.get('VITE_API_URL') || '').replace(/\/$/, '')
  let site = {}
  if (base) {
    try {
      const result = await fetch(`${base}/api/site`, { signal: AbortSignal.timeout(4000) })
      if (result.ok) site = await result.json()
    } catch {
      // Serve the static entries on their own if the API is down.
    }
  }
  return new Response(sitemapWithEntries(sitemap, { products: site.products, posts: site.posts }), {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=600' },
  })
}

export const config = { path: '/sitemap.xml' }
