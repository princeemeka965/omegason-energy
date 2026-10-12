import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { invalidateCatalog } from './api'
import {
  clearOtp,
  createCategory,
  deleteCategory,
  deleteProduct,
  deleteQuote,
  forgetOtp,
  getSession,
  loadDashboard,
  logoutAdmin,
  markQuoteRead,
  peekOtp,
  renameCategory,
  requestOtp,
  saveProduct,
  saveQuotesEmail,
  verifyOtp,
} from './adminStore'

const AdminContext = createContext(null)

const EMPTY = {
  ready: false,
  loadError: '',
  session: null,
  pendingOtp: null,
  categories: [],
  products: [],
  quotes: [],
  settings: { quotesEmail: '' },
}

export function AdminProvider({ children }) {
  const [state, setState] = useState(() => ({ ...EMPTY, pendingOtp: peekOtp() }))

  const applyDashboard = useCallback((session, data) => {
    setState((current) => ({
      ...current,
      ready: true,
      loadError: '',
      session,
      categories: data.categories,
      products: data.products,
      quotes: data.quotes,
      settings: data.settings,
    }))
  }, [])

  const refresh = useCallback(async () => {
    const data = await loadDashboard()
    setState((current) => ({
      ...current,
      categories: data.categories,
      products: data.products,
      quotes: data.quotes,
      settings: data.settings,
    }))
    return data
  }, [])

  useEffect(() => {
    let alive = true
    getSession()
      .then(async (session) => {
        if (!alive) return
        if (!session) {
          setState((current) => ({ ...current, ready: true, session: null }))
          return
        }
        const data = await loadDashboard()
        if (alive) applyDashboard(session, data)
      })
      .catch((error) => {
        if (!alive) return
        setState((current) => ({ ...current, ready: true, loadError: error.message, session: null }))
      })
    return () => {
      alive = false
    }
  }, [applyDashboard])

  const actions = useMemo(() => {
    return {
      requestOtp: async (input) => {
        const pending = await requestOtp(input)
        setState((current) => ({ ...current, pendingOtp: pending }))
        return pending
      },
      verifyOtp: async (code) => {
        const session = await verifyOtp(code)
        const data = await loadDashboard()
        applyDashboard(session, data)
        setState((current) => ({ ...current, pendingOtp: null }))
        return session
      },
      clearOtp: async () => {
        await clearOtp()
        setState((current) => ({ ...current, pendingOtp: null }))
      },
      logoutAdmin: async () => {
        await logoutAdmin()
        forgetOtp()
        setState((current) => ({
          ...EMPTY,
          ready: true,
          pendingOtp: null,
        }))
      },
      createCategory: async (label) => {
        await createCategory(label)
        invalidateCatalog()
        await refresh()
      },
      renameCategory: async (id, label) => {
        await renameCategory(id, label)
        invalidateCatalog()
        await refresh()
      },
      deleteCategory: async (id) => {
        await deleteCategory(id)
        invalidateCatalog()
        await refresh()
      },
      saveProduct: async (input, id) => {
        const product = await saveProduct(input, id)
        invalidateCatalog()
        await refresh()
        return product
      },
      deleteProduct: async (id) => {
        await deleteProduct(id)
        invalidateCatalog()
        await refresh()
      },
      markQuoteRead: async (id) => {
        await markQuoteRead(id)
        await refresh()
      },
      deleteQuote: async (id) => {
        await deleteQuote(id)
        await refresh()
      },
      saveQuotesEmail: async (email) => {
        const saved = await saveQuotesEmail(email)
        await refresh()
        return saved
      },
    }
  }, [applyDashboard, refresh])

  const value = useMemo(() => {
    const unreadQuotes = state.quotes.filter((quote) => !quote.read).length
    return { ...state, unreadQuotes, ...actions }
  }, [state, actions])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error('useAdmin must be used inside AdminProvider')
  return value
}
