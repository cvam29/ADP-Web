import { Button } from "@/components/ui/button"
import { Users, Calendar, BookOpen, PenTool } from "lucide-react"
import Link from "next/link"

const quickLinks = [
  {
    title: "Membership",
    description: "Join our community of nutrition professionals",
    icon: Users,
    href: "/membership",
  },
  {
    title: "Events",
    description: "Webinars, conferences, and continuing education",
    icon: Calendar,
    href: "/events",
  },
  {
    title: "Resources",
    description: "Research, tools, and professional materials",
    icon: BookOpen,
    href: "/resources",
  },
  {
    title: "Blog",
    description: "Latest insights and industry updates",
    icon: PenTool,
    href: "/blog",
  },
]

export function QuickLinks() {
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground tracking-tight mb-3">Everything You Need to Excel</h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Access professional resources, connect with peers, and advance your career in nutrition science.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <div
                key={link.title}
                className="group flex flex-col bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-colors duration-150"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-150">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{link.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">{link.description}</p>
                <Button asChild variant="outline" className="w-full rounded-full border-border text-foreground hover:bg-secondary text-sm">
                  <Link href={link.href}>Explore</Link>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
