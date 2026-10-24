// Pure helpers, plus the calls the admin screens make to the Express API.
import { request, uploadFile } from './http'

const ADMIN_PRESENCE = 'omegason.admin.present'

let adminRouteOpen = false

export function isAdminPath(pathname) {
  return pathname === '/auth/admin' || pathname.startsWith('/auth/admin/')
}

// The cookie survives a full page load, so a tab that was on an admin route
// records that here. The next non-admin page clears the session.
export function syncAdminPresence(pathname) {
  if (isAdminPath(pathname)) {
    adminRouteOpen = true
    try {
      sessionStorage.setItem(ADMIN_PRESENCE, '1')
    } catch {
      // Private mode can block storage. The in-memory flag still covers this tab.
    }
    return
  }
  let leftAdmin = adminRouteOpen
  adminRouteOpen = false
  try {
    if (sessionStorage.getItem(ADMIN_PRESENCE) === '1') leftAdmin = true
    sessionStorage.removeItem(ADMIN_PRESENCE)
  } catch {
    // Same as above.
  }
  if (leftAdmin) logoutAdmin()
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(value) {
  return EMAIL.test(String(value || '').trim())
}

export function formatWhen(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function isSizingQuote(quote) {
  return quote?.kind === 'sizing' || quote?.productName === 'Home solar sizing'
}

export function isContactMessage(quote) {
  return quote?.kind === 'general'
}

export function isQuoteRequest({ subject, productSlug }) {
  if (String(productSlug || '').trim()) return true
  return /quote/i.test(subject || '')
}

export async function getSession() {
  try {
    return await request('/api/auth/session')
  } catch (error) {
    if (error.status === 401) return null
    throw error
  }
}

export async function loadDashboard() {
  return request('/api/admin/bootstrap')
}

export async function signIn({ email, password }) {
  return request('/api/auth/login', { method: 'POST', body: { email, password } })
}

export async function logoutAdmin() {
  try {
    await request('/api/auth/logout', { method: 'POST' })
  } catch {
    // Drop the screen session even if the API is briefly unreachable.
  }
}

export function createCategory(label) {
  return request('/api/categories', { method: 'POST', body: { label } })
}

export function renameCategory(id, label) {
  return request(`/api/categories/${encodeURIComponent(id)}`, { method: 'PATCH', body: { label } })
}

export function deleteCategory(id) {
  return request(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function saveProduct(input, id) {
  if (id) return request(`/api/products/${encodeURIComponent(id)}`, { method: 'PUT', body: input })
  return request('/api/products', { method: 'POST', body: input })
}

export function deleteProduct(id) {
  return request(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function createPhase(input) {
  return request('/api/phases', { method: 'POST', body: input })
}

export function savePhase(id, input) {
  return request(`/api/phases/${encodeURIComponent(id)}`, { method: 'PUT', body: input })
}

export function deletePhase(id) {
  return request(`/api/phases/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function movePhase(id, direction) {
  return request(`/api/phases/${encodeURIComponent(id)}/move`, { method: 'POST', body: { direction } })
}

export function saveStory(phaseId, input, id) {
  if (id) return request(`/api/stories/${encodeURIComponent(id)}`, { method: 'PUT', body: input })
  return request(`/api/phases/${encodeURIComponent(phaseId)}/stories`, { method: 'POST', body: input })
}

export function deleteStory(id) {
  return request(`/api/stories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function moveStory(id, direction) {
  return request(`/api/stories/${encodeURIComponent(id)}/move`, { method: 'POST', body: { direction } })
}

export function getPost(id) {
  return request(`/api/admin/posts/${encodeURIComponent(id)}`)
}

export function savePost(input, id) {
  if (id) return request(`/api/admin/posts/${encodeURIComponent(id)}`, { method: 'PUT', body: input })
  return request('/api/admin/posts', { method: 'POST', body: input })
}

export function deletePost(id) {
  return request(`/api/admin/posts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function requestAccountChange(input) {
  return request('/api/settings/account', { method: 'POST', body: input })
}

export function confirmAccountChange(code) {
  return request('/api/settings/account/verify', { method: 'POST', body: { code } })
}

export function cancelAccountChange() {
  return request('/api/settings/account/otp', { method: 'DELETE' })
}

export function uploadImage(file) {
  return uploadFile('/api/uploads', file).then((payload) => payload.url)
}

export function addQuote(input) {
  return request('/api/quotes', { method: 'POST', body: input })
}

export function markQuoteRead(id) {
  return request(`/api/quotes/${encodeURIComponent(id)}`, { method: 'PATCH' })
}

export function deleteQuote(id) {
  return request(`/api/quotes/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function replyToQuote(id, message) {
  return request(`/api/quotes/${encodeURIComponent(id)}/reply`, { method: 'POST', body: { message } })
}
