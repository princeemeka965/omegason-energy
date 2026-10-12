function apiBase() {
  const raw = import.meta.env.VITE_API_URL
  if (!raw) throw new Error('Set VITE_API_URL to the Omegason API address.')
  return String(raw).replace(/\/$/, '')
}

export async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    const error = new Error('The admin API is not running. Start it from C:\\omegason-api.')
    error.status = 0
    throw error
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || 'Request failed.')
    error.status = response.status
    throw error
  }
  return payload
}
