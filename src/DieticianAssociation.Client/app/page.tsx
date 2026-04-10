import { Hero } from "@/components/hero"
import { QuickLinks } from "@/components/quick-links"
import { FeaturedContent } from "@/components/featured-content"
import { TrustSignals } from "@/components/trust-signals"
import { Newsletter } from "@/components/newsletter"
import TrustInfoTicker from "@/components/ui/TrustInfoTicker"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TrustInfoTicker />
      <Hero />
      <QuickLinks />
      <FeaturedContent />
      <TrustSignals />
      <Newsletter />
    </main>
  )
}
