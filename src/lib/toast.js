const listeners = new Set()
let items = []

export function subscribeToasts(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getToasts() {
  return items
}

function emit() {
  listeners.forEach((listener) => listener())
}

export function dismissToast(id) {
  const next = items.filter((item) => item.id !== id)
  if (next.length === items.length) return
  items = next
  emit()
}

export function pushToast({ tone, message }) {
  const text = String(message || '').trim()
  if (!text) return
  const id = crypto.randomUUID()
  items = [...items, { id, tone, message: text }].slice(-4)
  emit()
  window.setTimeout(() => dismissToast(id), 5000)
}

const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function isMutation(method) {
  return MUTATIONS.has(String(method || 'GET').toUpperCase())
}

export function mutationSuccess(method, path) {
  const verb = String(method || '').toUpperCase()
  const route = String(path || '').split('?')[0]
  if (route === '/api/auth/login') return 'Signed in.'
  if (route === '/api/auth/logout') return 'Signed out.'
  if (route === '/api/uploads') return 'Image uploaded.'
  if (route === '/api/quotes') return 'Quote request sent.'
  if (route.endsWith('/reply')) return 'Reply sent.'
  if (route.endsWith('/move')) return 'Order updated.'
  if (route === '/api/settings/account') return 'Verification code sent.'
  if (route === '/api/settings/account/verify') return 'Account updated.'
  if (route === '/api/settings/account/otp') return 'Change cancelled.'
  if (verb === 'PATCH' && /^\/api\/quotes\/[^/]+$/.test(route)) return 'Marked as read.'
  if (verb === 'POST' && route === '/api/products') return 'Product added.'
  if (verb === 'PUT' && route.startsWith('/api/products/')) return 'Product saved.'
  if (verb === 'DELETE' && route.startsWith('/api/products/')) return 'Product deleted.'
  if (verb === 'POST' && route === '/api/categories') return 'Category added.'
  if (verb === 'PATCH' && route.startsWith('/api/categories/')) return 'Category renamed.'
  if (verb === 'DELETE' && route.startsWith('/api/categories/')) return 'Category deleted.'
  if (verb === 'POST' && route === '/api/phases') return 'Phase added.'
  if (verb === 'PUT' && /^\/api\/phases\/[^/]+$/.test(route)) return 'Phase saved.'
  if (verb === 'DELETE' && route.startsWith('/api/phases/')) return 'Phase deleted.'
  if (verb === 'POST' && route.includes('/stories')) return 'Story added.'
  if (verb === 'PUT' && route.startsWith('/api/stories/')) return 'Story saved.'
  if (verb === 'DELETE' && route.startsWith('/api/stories/')) return 'Story deleted.'
  if (verb === 'DELETE' && route.includes('/quotes/')) return 'Request removed.'
  if (verb === 'DELETE') return 'Deleted.'
  if (verb === 'POST') return 'Saved.'
  return 'Changes saved.'
}

export function notifyMutation(method, path, { ok, message, payload }) {
  if (!isMutation(method)) return
  if (!ok) {
    pushToast({ tone: 'error', message: message || 'Request failed.' })
    return
  }
  if (payload && payload.emailed === false) {
    pushToast({ tone: 'error', message: payload.emailError || 'The reply is saved. The email did not go out.' })
    return
  }
  pushToast({ tone: 'success', message: mutationSuccess(method, path) })
}
