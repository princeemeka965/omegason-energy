import { ArrowRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Seo, { absoluteUrl } from '../components/Seo'
import { site } from '../data/site'
import { formatPostDate, postHref, usePosts } from '../lib/api'

const DESCRIPTION = 'Notes from Omegason on solar power, energy storage and keeping homes and businesses running.'

function PostMeta({ post }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
      <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
      <span aria-hidden="true"> · </span>
      {post.readingMinutes} min read
    </p>
  )
}

function Cover({ post, className }) {
  if (post.coverImage) return <img src={post.coverImage} alt="" className={`w-full object-cover ${className}`} loading="lazy" />
  return <div className={`w-full bg-navy/10 ${className}`} aria-hidden="true" />
}

export default function Blog() {
  const { posts, loading, error } = usePosts()
  const [lead, ...rest] = posts
  const origin = site.url.replace(/\/$/, '')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${origin}/blog#blog`,
    name: `${site.name} blog`,
    description: DESCRIPTION,
    url: `${origin}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Omegason Integrated Energy Services Ltd',
      logo: { '@type': 'ImageObject', url: absoluteUrl('/media/omegason.png') },
    },
    blogPost: posts.slice(0, 20).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${origin}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      ...(post.coverImage ? { image: absoluteUrl(post.coverImage) } : {}),
    })),
  }

  return (
    <>
      <Seo title="Blog" description={DESCRIPTION} path="/blog" image={lead?.coverImage || undefined} jsonLd={jsonLd} />
      <PageHeader title="Blog">Notes from the team on solar power, storage and the projects we build.</PageHeader>

      <section className="bg-white px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          {loading && <p className="text-lg text-muted">Loading posts…</p>}
          {!loading && error && <p role="alert" className="text-lg text-muted">{error}</p>}
          {!loading && !error && posts.length === 0 && <p className="text-lg text-muted">New posts will appear here soon.</p>}

          {lead && (
            <article className="border-b border-line pb-12">
              <a href={postHref(lead)} className="group grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="overflow-hidden lg:col-span-7">
                  <Cover post={lead} className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                <div className="lg:col-span-5">
                  <PostMeta post={lead} />
                  <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy group-hover:underline group-hover:decoration-brass group-hover:decoration-2 group-hover:underline-offset-4 md:text-4xl">
                    {lead.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{lead.excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold text-navy">
                    Read the post <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            </article>
          )}

          {rest.length > 0 && (
            <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post.id}>
                  <article>
                    <a href={postHref(post)} className="group block">
                      <div className="overflow-hidden">
                        <Cover post={post} className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]" />
                      </div>
                      <div className="mt-5">
                        <PostMeta post={post} />
                        <h2 className="mt-2 font-display text-2xl font-semibold leading-snug text-navy group-hover:underline group-hover:decoration-brass group-hover:decoration-2 group-hover:underline-offset-4">
                          {post.title}
                        </h2>
                        <p className="mt-3 line-clamp-3 leading-relaxed text-muted">{post.excerpt}</p>
                      </div>
                    </a>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
