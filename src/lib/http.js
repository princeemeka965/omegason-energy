import { notifyMutation } from './toast'

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
    notifyMutation(method, path, { ok: false, message: error.message })
    throw error
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || 'Request failed.')
    error.status = response.status
    notifyMutation(method, path, { ok: false, message: error.message })
    throw error
  }
  notifyMutation(method, path, { ok: true, payload })
  return payload
}

export async function uploadFile(path, file) {
  let response
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
  } catch {
    const error = new Error('The admin API is not running. Start it from C:\\omegason-api.')
    error.status = 0
    notifyMutation('POST', path, { ok: false, message: error.message })
    throw error
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || 'The image could not be uploaded.')
    error.status = response.status
    notifyMutation('POST', path, { ok: false, message: error.message })
    throw error
  }
  notifyMutation('POST', path, { ok: true, payload })
  return payload
}
