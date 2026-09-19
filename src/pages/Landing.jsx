import LandingHeader from './landing/LandingHeader'
import Hero from './landing/Hero'
import { FeaturesRow, StorySection, Closing } from './landing/Sections'
import AppPreview from './landing/AppPreview'
import LandingFooter from './landing/LandingFooter'

export default function Landing() {
  return (
    <div className="landing flex min-h-dvh flex-col bg-lnd-paper paper-texture text-lnd-ink">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <FeaturesRow />
        <StorySection />
        <AppPreview />
        <Closing />
      </main>
      <LandingFooter />
    </div>
  )
}