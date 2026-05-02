import { HeroSection } from '@/components/hero-section'
import { TicketCards } from '@/components/ticket-cards'
import { ActivitiesSection } from '@/components/activities-section'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <TicketCards />
      <ActivitiesSection />
      <Footer />
    </main>
  )
}
