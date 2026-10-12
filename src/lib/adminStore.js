// Pure helpers, plus the calls the admin screens make to the Express API.
import { request } from './http'

const OTP_KEY = 'omegason.admin.otp'

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

export function isQuoteRequest({ subject, productSlug }) {
  if (String(productSlug || '').trim()) return true
  return /quote/i.test(subject || '')
}

export function peekOtp() {
  if (typeof window === 'undefined') return null
  try {
    const pending = JSON.parse(sessionStorage.getItem(OTP_KEY) || 'null')
    if (!pending?.email || !pending.expiresAt) return null
    if (Date.parse(pending.expiresAt) <= Date.now()) {
      sessionStorage.removeItem(OTP_KEY)
      return null
    }
    return pending
  } catch {
    return null
  }
}

function rememberOtp(pending) {
  sessionStorage.setItem(OTP_KEY, JSON.stringify(pending))
  return pending
}

export function forgetOtp() {
  sessionStorage.removeItem(OTP_KEY)
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

export async function requestOtp({ email, password }) {
  const pending = await request('/api/auth/login', { method: 'POST', body: { email, password } })
  return rememberOtp(pending)
}

export async function verifyOtp(code) {
  const pending = peekOtp()
  if (!pending?.email) throw new Error('That code has expired. Request a new one.')
  const session = await request('/api/auth/verify', {
    method: 'POST',
    body: { email: pending.email, code },
  })
  forgetOtp()
  return session
}

export async function clearOtp() {
  const pending = peekOtp()
  forgetOtp()
  if (!pending?.email) return
  try {
    await request('/api/auth/otp', { method: 'DELETE', body: { email: pending.email } })
  } catch {
    // The local step is already cleared. A leftover code expires on its own.
  }
}

export async function logoutAdmin() {
  forgetOtp()
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

export function saveQuotesEmail(email) {
  return request('/api/settings/quotes-email', { method: 'PUT', body: { email } }).then((settings) => settings.quotesEmail)
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
