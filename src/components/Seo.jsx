import { useEffect } from 'react'
import { site } from '../data/site'

const ORIGIN = site.url.replace(/\/$/, '')

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function absolute(pathOrUrl) {
  if (!pathOrUrl) return `${ORIGIN}/media/hybrid.jpg`
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  return `${ORIGIN}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Omegason Integrated Energy Services Ltd',
    url: ORIGIN,
    logo: absolute('/media/omegason.png'),
    image: absolute('/media/hybrid.jpg'),
    description: 'Omegason Integrated Energy Services Ltd welcomes you to a future where clean, reliable, and affordable energy drives communities and businesses forward.',
    telephone: '+2349025932104',
    email: site.emails.map((item) => item.address),
    faxNumber: '+2348072222271',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '180 Agbani Road',
      addressLocality: 'Enugu',
      addressRegion: 'Enugu State',
      addressCountry: 'NG',
    },
    areaServed: ['Nigeria', 'United Kingdom'],
    knowsAbout: ['Solar energy', 'Hydro energy', 'Electrical grids', 'Battery energy storage', 'Wind energy'],
  }
}

export function absoluteUrl(pathOrUrl) {
  return absolute(pathOrUrl)
}

const ARTICLE_META = ['article:published_time', 'article:modified_time', 'article:section']

export default function Seo({
  title,
  description,
  path = '/',
  image = '/media/hybrid.jpg',
  imageAlt = '',
  type = 'website',
  article,
  jsonLd,
  noindex = false,
}) {
  const payload = jsonLd ? JSON.stringify(jsonLd) : ''
  const published = article?.publishedTime || ''
  const modified = article?.modifiedTime || ''

  useEffect(() => {
    const fullTitle = title.includes('Omegason') ? title : `${title} | Omegason Integrated Energy Services`
    const url = `${ORIGIN}${path === '/' ? '/' : path}`
    const imageUrl = absolute(image)

    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('property', 'og:image:alt', imageAlt)
    const articleValues = type === 'article' ? [published, modified || published, 'Blog'] : []
    ARTICLE_META.forEach((key, index) => upsertMeta('property', key, articleValues[index] || ''))
    upsertMeta('property', 'og:site_name', site.name)
    upsertMeta('property', 'og:locale', 'en_NG')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', imageUrl)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url

    const id = 'seo-jsonld'
    let script = document.getElementById(id)
    if (payload) {
      if (!script) {
        script = document.createElement('script')
        script.id = id
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = payload
    } else {
      script?.remove()
    }
  }, [title, description, path, image, imageAlt, type, published, modified, payload, noindex])

  return null
}
