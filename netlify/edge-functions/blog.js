// Serves /blog and /blog/<slug> with the post's own title, description, image and
// structured data in the HTML, plus the article text inside #root. Search engines
// and link previews (WhatsApp, Facebook, LinkedIn, X) read this without running
// JavaScript; React replaces the markup when it loads.
import { blogIndexPage, notFoundPage, postPage, renderShell, rssFeed } from './lib/seo.js'

function apiBase() {
  const raw = Netlify.env.get('API_URL') || Netlify.env.get('VITE_API_URL') || ''
  return raw.replace(/\/$/, '')
}

async function api(path) {
  const base = apiBase()
  if (!base) return { ok: false, status: 0 }
  try {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(4000) })
    if (!response.ok) return { ok: false, status: response.status }
    return { ok: true, status: response.status, data: await response.json() }
  } catch {
    return { ok: false, status: 0 }
  }
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}

export default async function handler(request, context) {
  const { pathname } = new URL(request.url)
  const slug = decodeURIComponent(pathname.replace(/^\/blog\/?/, '').replace(/\/$/, ''))

  if (slug === 'rss.xml') {
    const result = await api('/api/posts')
    return new Response(rssFeed(result.ok ? result.data.posts || [] : []), {
      headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=600' },
    })
  }

  const shellResponse = await context.next()
  if (!(shellResponse.headers.get('content-type') || '').includes('text/html')) return shellResponse
  const shell = await shellResponse.text()

  if (!slug) {
    const result = await api('/api/posts')
    if (!result.ok) return html(shell)
    return html(renderShell(shell, blogIndexPage(result.data.posts || [])))
  }

  if (slug.includes('/')) return html(renderShell(shell, notFoundPage(slug)), 404)

  const result = await api(`/api/posts/${encodeURIComponent(slug)}`)
  if (result.ok) return html(renderShell(shell, postPage(result.data)))
  // Only a confirmed miss is a 404. If the API is unreachable the app still loads and retries.
  if (result.status === 404) return html(renderShell(shell, notFoundPage(slug)), 404)
  return html(shell)
}

export const config = { path: ['/blog', '/blog/*'] }
