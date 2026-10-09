import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import { projects, site } from '../data/site'

export default function Projects() {
  return (
    <>
      <Seo
        title="Phase One Energy Projects"
        description="Phase One of the Omegason Energy project brought reliable electricity to hundreds of households, a university, a primary school and local businesses."
        path="/projects"
        image="/media/healthcare.jpg"
      />
      <PageHeader title="Phase One">
        Reliable electricity for a university, a primary school, local businesses and hundreds of households.
      </PageHeader>

      <section className="bg-white px-6 py-8 md:px-10">
        <div className="mx-auto max-w-7xl divide-y divide-line">
          {projects.map((project) => (
            <article key={project.id} className="grid gap-8 py-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                {project.image && (
                  <img src={project.image} alt={project.title} className="aspect-[16/10] w-full object-cover" />
                )}
              </div>
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">{project.tag}</p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-navy">{project.title}</h2>
                <div className="prose-copy mt-4 text-lg leading-relaxed text-muted">
                  {project.paragraphs.map((p) => <p key={p.slice(0, 48)}>{p}</p>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-paper px-6 py-16 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold text-navy">Technical note</h2>
            <p className="mt-2 max-w-xl text-muted">Read the paper on executing a 1 megawatt interconnected solar plant, or speak with the team about a site of your own.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={site.technicalPdf} target="_blank" rel="noreferrer" className="btn btn-primary">
              <FileText size={18} aria-hidden="true" /> Technical paper (PDF)
            </a>
            <Link to="/contact" className="btn btn-outline">Discuss a project</Link>
          </div>
        </div>
      </section>
    </>
  )
}
