import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { organizationJsonLd } from './components/Seo'
import { syncAdminPresence } from './lib/adminStore'
import { fetchSite } from './lib/api'
import Home from './pages/Home'

const About = lazy(() => import('./pages/About'))
const Leadership = lazy(() => import('./pages/Leadership'))
const Services = lazy(() => import('./pages/Services'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Projects = lazy(() => import('./pages/Projects'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminApp = lazy(() => import('./pages/admin/AdminApp'))

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname === '/auth/admin' || location.pathname.startsWith('/auth/admin/')

  useEffect(() => {
    syncAdminPresence(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (!isAdmin) fetchSite().catch(() => {})
  }, [isAdmin])

  useEffect(() => {
    const id = 'seo-organization'
    let script = document.getElementById(id)
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(organizationJsonLd())
  }, [])

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-paper" />}>
        <AdminApp />
      </Suspense>
    )
  }

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-navy focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <Navbar />
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.main
          id="main"
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Suspense fallback={<div className="min-h-[70vh]" />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/leadership" element={<Leadership />} />
              <Route path="/services" element={<Services />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}
