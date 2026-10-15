// Pure helpers shared by the blog edge functions. No Netlify or Deno globals here,
// so the same code runs under Node for testing.

export const SITE = {
  origin: 'https://www.omegasonenergy.org',
  name: 'Omegason Integrated Energy Services',
  legalName: 'Omegason Integrated Energy Services Ltd',
  logo: 'https://www.omegasonenergy.org/media/omegason.png',
  image: 'https://www.omegasonenergy.org/media/hybrid.jpg',
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// JSON inside <script> must not be able to close the tag.
function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function absoluteUrl(pathOrUrl, origin = SITE.origin) {
  if (!pathOrUrl) return SITE.image
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

export function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'long', timeZone: 'Africa/Lagos' }).format(date)
}

function setTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`)
}

function metaPattern(attr, key) {
  return new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'i')
}

// Rewrites the head of the SPA shell: title, description, canonical, Open Graph,
// Twitter, robots, extra meta and JSON-LD. Then fills #root with crawlable markup
// that React replaces on load.
export function renderShell(shell, page) {
  let html = shell
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const url = escapeHtml(page.url)
  const image = escapeHtml(page.image || SITE.image)

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  html = setTag(html, metaPattern('name', 'description'), `<meta name="description" content="${description}" />`)
  html = setTag(
    html,
    metaPattern('name', 'robots'),
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
  )
  html = setTag(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${url}" />`)

  const og = {
    'og:title': title,
    'og:description': description,
    'og:type': page.type || 'website',
    'og:url': url,
    'og:image': image,
  }
  for (const [key, value] of Object.entries(og)) {
    html = setTag(html, metaPattern('property', key), `<meta property="${key}" content="${value}" />`)
  }
  if (page.imageAlt) {
    html = setTag(html, metaPattern('property', 'og:image:alt'), `<meta property="og:image:alt" content="${escapeHtml(page.imageAlt)}" />`)
  }
  const twitter = { 'twitter:title': title, 'twitter:description': description, 'twitter:image': image }
  for (const [key, value] of Object.entries(twitter)) {
    html = setTag(html, metaPattern('name', key), `<meta name="${key}" content="${value}" />`)
  }

  const extra = (page.meta || [])
    .filter((item) => item.content)
    .map((item) => `<meta property="${escapeHtml(item.property)}" content="${escapeHtml(item.content)}" />`)
  const scripts = page.jsonLd ? [`<script type="application/ld+json" id="seo-jsonld">${jsonForScript(page.jsonLd)}</script>`] : []
  const feed = `<link rel="alternate" type="application/rss+xml" title="${escapeHtml(SITE.name)} blog" href="${SITE.origin}/blog/rss.xml" />`
  html = html.replace('</head>', `    ${[...extra, feed, ...scripts].join('\n    ')}\n  </head>`)

  if (page.body) html = html.replace(/<div id="root"><\/div>/, `<div id="root">${page.body}</div>`)
  return html
}

export function postPage(post, origin = SITE.origin) {
  const url = `${origin}/blog/${post.slug}`
  const image = post.coverImage ? absoluteUrl(post.coverImage, origin) : SITE.image
  const date = formatDate(post.publishedAt)
  const body = `<main id="main"><article>
<p><a href="/blog">Blog</a></p>
<h1>${escapeHtml(post.title)}</h1>
<p><time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(date)}</time> · ${Number(post.readingMinutes) || 1} min read</p>
${post.coverImage ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(post.title)}" />` : ''}
${post.body || ''}
</article></main>`
  return {
    title: `${post.title} | ${SITE.name}`,
    description: post.excerpt,
    url,
    image,
    imageAlt: post.title,
    type: 'article',
    meta: [
      { property: 'article:published_time', content: post.publishedAt },
      { property: 'article:modified_time', content: post.updatedAt },
      { property: 'article:section', content: 'Blog' },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': `${url}#article`,
          headline: post.title,
          description: post.excerpt,
          image: [image],
          datePublished: post.publishedAt,
          dateModified: post.updatedAt || post.publishedAt,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          author: { '@type': 'Organization', name: SITE.legalName, url: origin },
          publisher: { '@type': 'Organization', name: SITE.legalName, logo: { '@type': 'ImageObject', url: SITE.logo } },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: url },
          ],
        },
      ],
    },
    body,
  }
}

export const BLOG_DESCRIPTION = 'Notes from Omegason on solar power, energy storage and keeping homes and businesses running.'

export function blogIndexPage(posts, origin = SITE.origin) {
  const url = `${origin}/blog`
  const items = posts
    .map(
      (post) => `<li><article>
<h2><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h2>
<p><time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(formatDate(post.publishedAt))}</time></p>
<p>${escapeHtml(post.excerpt)}</p>
</article></li>`,
    )
    .join('\n')
  return {
    title: `Blog | ${SITE.name}`,
    description: BLOG_DESCRIPTION,
    url,
    image: posts[0]?.coverImage ? absoluteUrl(posts[0].coverImage, origin) : SITE.image,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${url}#blog`,
      name: `${SITE.name} blog`,
      description: BLOG_DESCRIPTION,
      url,
      publisher: { '@type': 'Organization', name: SITE.legalName, logo: { '@type': 'ImageObject', url: SITE.logo } },
      blogPost: posts.slice(0, 20).map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: `${origin}/blog/${post.slug}`,
        datePublished: post.publishedAt,
        ...(post.coverImage ? { image: absoluteUrl(post.coverImage, origin) } : {}),
      })),
    },
    body: `<main id="main"><h1>Blog</h1><p>${escapeHtml(BLOG_DESCRIPTION)}</p><ul>${items}</ul></main>`,
  }
}

export function notFoundPage(slug, origin = SITE.origin) {
  return {
    title: `Post not found | ${SITE.name}`,
    description: 'That blog post could not be found.',
    url: `${origin}/blog/${slug}`,
    noindex: true,
  }
}

function sitemapEntry(origin, path, lastmod) {
  const day = String(lastmod || '').slice(0, 10)
  return `  <url><loc>${escapeHtml(`${origin}${path}`)}</loc>${day ? `<lastmod>${day}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.6</priority></url>`
}

export function sitemapWithEntries(sitemap, { products = [], posts = [] }, origin = SITE.origin) {
  const entries = [
    ...products.map((product) => sitemapEntry(origin, `/products/${product.slug}`, product.updatedAt)),
    ...posts.map((post) => sitemapEntry(origin, `/blog/${post.slug}`, post.updatedAt || post.publishedAt)),
  ].join('\n')
  if (!entries) return sitemap
  return sitemap.replace('</urlset>', `${entries}\n</urlset>`)
}

export function rssFeed(posts, origin = SITE.origin) {
  const items = posts
    .slice(0, 30)
    .map((post) => {
      const url = `${origin}/blog/${post.slug}`
      return `    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${escapeHtml(url)}</link>
      <guid isPermaLink="true">${escapeHtml(url)}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeHtml(post.excerpt)}</description>
    </item>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(SITE.name)} blog</title>
    <link>${origin}/blog</link>
    <description>${escapeHtml(BLOG_DESCRIPTION)}</description>
    <language>en-NG</language>
    <atom:link href="${origin}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
}
