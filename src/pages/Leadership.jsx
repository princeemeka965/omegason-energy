import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import TeamProfiles from '../components/TeamProfiles'

export default function Leadership() {
  return (
    <>
      <Seo
        title="Leadership"
        description="Leadership of Omegason Integrated Energy Services: the chairman, chief executive, finance and operations leads who run the company."
        path="/leadership"
      />
      <PageHeader title="Leadership">
        Meet our team
      </PageHeader>

      <section className="bg-white px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <TeamProfiles />
        </div>
      </section>
    </>
  )
}
