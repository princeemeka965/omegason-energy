import DOMPurify from 'dompurify'

const PURIFY = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
}

export function sanitizeHtml(html) {
  const clean = DOMPurify.sanitize(html || '', PURIFY)
  if (!clean || typeof document === 'undefined') return clean
  const tpl = document.createElement('template')
  tpl.innerHTML = clean
  tpl.content.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href') || ''
    if (!/^(https?:|mailto:)/i.test(href)) anchor.removeAttribute('href')
    anchor.setAttribute('rel', 'noopener noreferrer')
    anchor.setAttribute('target', '_blank')
  })
  return tpl.innerHTML
}
