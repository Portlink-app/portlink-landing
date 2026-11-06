import FamilyHero from '@/components/product-family/FamilyHero'
import FamilyStory from '@/components/product-family/FamilyStory'
import FamilyLink from '@/components/product-family/FamilyLink'
import PlatformExplorer from '@/components/scenes/PlatformExplorer'
import EcosystemSection from '@/components/sections/EcosystemSection'
import TeamProofSection from '@/components/sections/TeamProofSection'
import AccessSection from '@/components/sections/AccessSection'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return <>
    <main id="main" tabIndex={-1}>
      <FamilyHero product="Portlink"/>
      <FamilyStory product="Portlink"/>
      <FamilyLink from="Portlink"/>
      <PlatformExplorer/>
      <EcosystemSection/>
      <TeamProofSection/>
      <AccessSection/>
    </main>
    <Footer/>
  </>
}
