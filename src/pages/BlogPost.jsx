import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo, { absoluteUrl } from '../components/Seo'
import { site } from '../data/site'
import { fetchPosts, formatPostDate, postHref, usePost } from '../lib/api'
import { sanitizeArticle } from '../lib/sanitize'

function useMorePosts(slug) {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    let alive = true
    fetchPosts()
      .then((list) => alive && setPosts(list.filter((post) => post.slug !== slug).slice(0, 3)))
      .catch(() => alive && setPosts([]))
    return () => {
      alive = false
    }
  }, [slug])
  return posts
}

export default function BlogPost() {
  const { slug } = useParams()
  const { post, loading, error } = usePost(slug)
  const more = useMorePosts(slug)

  if (loading) return <div className="min-h-[70vh]" />

  if (!post) {
    return (
      <section className="bg-white px-6 py-24 md:px-10">
        <Seo title="Post not found" description="That blog post could not be found." path={`/blog/${slug}`} noindex />
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-semibold text-navy">{error ? 'This post could not be loaded' : 'Post not found'}</h1>
          <p className="mt-3 text-lg text-muted">{error || 'It may have been moved or taken down.'}</p>
          <Link to="/blog" className="btn btn-primary mt-8">Back to the blog</Link>
        </div>
      </section>
    )
  }

  const origin = site.url.replace(/\/$/, '')
  const url = `${origin}/blog/${post.slug}`
  const image = absoluteUrl(post.coverImage || undefined)
  const organization = {
    '@type': 'Organization',
    name: 'Omegason Integrated Energy Services Ltd',
    url: origin,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/media/omegason.png') },
  }
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        image: [image],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: organization,
        publisher: organization,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  }

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.coverImage || undefined}
        imageAlt={post.title}
        type="article"
        article={{ publishedTime: post.publishedAt, modifiedTime: post.updatedAt }}
        jsonLd={jsonLd}
      />
      <article>
        <header className="border-b border-line bg-navy text-white">
          <div className="mx-auto max-w-3xl px-6 py-12 md:px-0 md:py-16">
            <nav aria-label="Breadcrumb">
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-brass-soft hover:text-white">
                <ArrowLeft size={16} aria-hidden="true" /> Blog
              </Link>
            </nav>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{post.title}</h1>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              <span aria-hidden="true"> · </span>
              {post.readingMinutes} min read
            </p>
          </div>
        </header>

        {post.coverImage && (
          <div className="bg-paper px-6 pt-10 md:px-10">
            <img src={post.coverImage} alt={post.title} className="mx-auto aspect-[16/9] w-full max-w-5xl object-cover" fetchPriority="high" />
          </div>
        )}

        <div className="bg-white px-6 py-12 md:px-10 md:py-16">
          <div className="rich-copy article-copy mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: sanitizeArticle(post.body) }} />
        </div>
      </article>

      <section className="border-t border-line bg-paper px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          {more.length > 0 && (
            <>
              <h2 className="font-display text-3xl font-semibold text-navy">More from the blog</h2>
              <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((item) => (
                  <li key={item.id}>
                    <article>
                      <a href={postHref(item)} className="group block">
                        <div className="overflow-hidden">
                          {item.coverImage
                            ? <img src={item.coverImage} alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                            : <div className="aspect-[16/10] w-full bg-navy/10" aria-hidden="true" />}
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-brass">{formatPostDate(item.publishedAt)}</p>
                        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-navy group-hover:underline group-hover:decoration-brass group-hover:decoration-2 group-hover:underline-offset-4">
                          {item.title}
                        </h3>
                      </a>
                    </article>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className={`flex flex-col justify-between gap-6 md:flex-row md:items-center ${more.length ? 'mt-14 border-t border-line pt-10' : ''}`}>
            <div>
              <h2 className="font-display text-2xl font-semibold text-navy">Planning a solar installation?</h2>
              <p className="mt-2 max-w-xl text-muted">Tell us about the site and the team will size a system for it.</p>
            </div>
            <Link to="/contact" className="btn btn-primary">Talk to the team</Link>
          </div>
        </div>
      </section>
    </>
  )
}
