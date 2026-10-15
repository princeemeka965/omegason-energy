import DOMPurify from 'dompurify'

const PURIFY = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
}

const ARTICLE = {
  ALLOWED_TAGS: [...PURIFY.ALLOWED_TAGS, 'img'],
  ALLOWED_ATTR: [...PURIFY.ALLOWED_ATTR, 'src', 'alt'],
}

function clean(html, options) {
  const output = DOMPurify.sanitize(html || '', options)
  if (!output || typeof document === 'undefined') return output
  const tpl = document.createElement('template')
  tpl.innerHTML = output
  tpl.content.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href') || ''
    if (!/^(https?:|mailto:)/i.test(href)) anchor.removeAttribute('href')
    anchor.setAttribute('rel', 'noopener noreferrer')
    anchor.setAttribute('target', '_blank')
  })
  tpl.content.querySelectorAll('img').forEach((image) => {
    if (!/^https?:\/\//i.test(image.getAttribute('src') || '')) image.remove()
  })
  return tpl.innerHTML
}

export function sanitizeHtml(html) {
  return clean(html, PURIFY)
}

export function sanitizeArticle(html) {
  return clean(html, ARTICLE)
}
