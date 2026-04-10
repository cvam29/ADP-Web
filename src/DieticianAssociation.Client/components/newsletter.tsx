import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  return (
    <section className="bg-herb-950 border-t border-herb-800 dark:bg-herb-950 dark:border-herb-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-grain-300 mb-6">
            Newsletter
          </span>
          <h2 className="text-3xl font-bold text-herb-50 tracking-tight mb-3">Stay Updated</h2>
          <p className="text-herb-300 text-base leading-relaxed mb-10">
            Get the latest nutrition research, professional updates, and exclusive member content delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-herb-900 border-herb-700 text-herb-50 placeholder:text-herb-500 focus:border-herb-500 focus-visible:ring-0 rounded-full px-5 h-11"
            />
            <Button type="submit" className="rounded-full bg-grain-500 hover:bg-grain-400 text-white px-7 shrink-0 h-11">
              Subscribe
            </Button>
          </form>
          <p className="text-herb-600 text-xs mt-5">No spam. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  )
}
