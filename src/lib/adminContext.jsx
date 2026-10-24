import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { invalidateCatalog, invalidatePhases, invalidatePosts } from './api'
import {
  cancelAccountChange,
  confirmAccountChange,
  createCategory,
  createPhase,
  deleteCategory,
  deletePhase,
  deletePost,
  getPost,
  savePost,
  deleteProduct,
  deleteQuote,
  deleteStory,
  getSession,
  isContactMessage,
  isSizingQuote,
  loadDashboard,
  logoutAdmin,
  markQuoteRead,
  movePhase,
  replyToQuote,
  moveStory,
  renameCategory,
  requestAccountChange,
  signIn as signInRequest,
  savePhase,
  saveProduct,
  saveStory,
} from './adminStore'

const AdminContext = createContext(null)

const EMPTY = {
  ready: false,
  loadError: '',
  session: null,
  categories: [],
  products: [],
  quotes: [],
  settings: { quotesEmail: '' },
  account: { name: '', email: '' },
  phases: [],
  posts: [],
}

export function AdminProvider({ children }) {
  const [state, setState] = useState(EMPTY)

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
      account: data.account || { name: '', email: session?.email || '' },
      phases: data.phases || [],
      posts: data.posts || [],
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
      account: data.account || current.account,
      phases: data.phases || [],
      posts: data.posts || [],
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
      signIn: async (input) => {
        const session = await signInRequest(input)
        const data = await loadDashboard()
        applyDashboard(session, data)
        return session
      },
      logoutAdmin: async () => {
        await logoutAdmin()
        setState((current) => ({
          ...EMPTY,
          ready: true,
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
      createPhase: async (input) => {
        const phase = await createPhase(input)
        invalidatePhases()
        await refresh()
        return phase
      },
      savePhase: async (id, input) => {
        const phase = await savePhase(id, input)
        invalidatePhases()
        await refresh()
        return phase
      },
      deletePhase: async (id) => {
        await deletePhase(id)
        invalidatePhases()
        await refresh()
      },
      movePhase: async (id, direction) => {
        await movePhase(id, direction)
        invalidatePhases()
        await refresh()
      },
      saveStory: async (phaseId, input, id) => {
        const phase = await saveStory(phaseId, input, id)
        invalidatePhases()
        await refresh()
        return phase
      },
      deleteStory: async (id) => {
        await deleteStory(id)
        invalidatePhases()
        await refresh()
      },
      moveStory: async (id, direction) => {
        await moveStory(id, direction)
        invalidatePhases()
        await refresh()
      },
      getPost: (id) => getPost(id),
      savePost: async (input, id) => {
        const post = await savePost(input, id)
        invalidatePosts()
        await refresh()
        return post
      },
      deletePost: async (id) => {
        await deletePost(id)
        invalidatePosts()
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
      replyToQuote: async (id, message) => {
        const result = await replyToQuote(id, message)
        await refresh()
        return result
      },
      requestAccountChange: (input) => requestAccountChange(input),
      confirmAccountChange: async (code) => {
        const account = await confirmAccountChange(code)
        setState((current) => ({
          ...current,
          account,
          session: current.session ? { ...current.session, email: account.email } : current.session,
        }))
        await refresh()
        return account
      },
      cancelAccountChange: () => cancelAccountChange(),
    }
  }, [applyDashboard, refresh])

  const value = useMemo(() => {
    const unreadQuotes = state.quotes.filter((quote) => !isSizingQuote(quote) && !isContactMessage(quote) && !quote.read).length
    const unreadMessages = state.quotes.filter((quote) => isContactMessage(quote) && !quote.read).length
    const unreadSizing = state.quotes.filter((quote) => isSizingQuote(quote) && !quote.read).length
    return { ...state, unreadQuotes, unreadMessages, unreadSizing, ...actions }
  }, [state, actions])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error('useAdmin must be used inside AdminProvider')
  return value
}
