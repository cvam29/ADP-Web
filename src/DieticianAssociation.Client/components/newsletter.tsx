import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  return (
    <section className="py-8 bg-emerald-600">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Get the latest nutrition research, professional updates, and exclusive member content delivered to your
            inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
            />
            <Button type="submit" variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50">
              Subscribe
            </Button>
          </form>
          <p className="text-emerald-100 text-sm mt-4">No spam. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  )
}
