import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BookOpen, PenTool } from "lucide-react"
import Link from "next/link"

const quickLinks = [
  {
    title: "Membership",
    description: "Join our community of nutrition professionals",
    icon: Users,
    href: "/membership",
    color: "text-emerald-600",
  },
  {
    title: "Events",
    description: "Webinars, conferences, and continuing education",
    icon: Calendar,
    href: "/events",
    color: "text-blue-600",
  },
  {
    title: "Resources",
    description: "Research, tools, and professional materials",
    icon: BookOpen,
    href: "/resources",
    color: "text-purple-600",
  },
  {
    title: "Blog",
    description: "Latest insights and industry updates",
    icon: PenTool,
    href: "/blog",
    color: "text-amber-600",
  },
]

export function QuickLinks() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need to Excel</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Access professional resources, connect with peers, and advance your career in nutrition science.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Card key={link.title} className="group hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div
                    className={`mx-auto w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-6 h-6 ${link.color}`} />
                  </div>
                  <CardTitle className="text-xl">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={link.href}>Explore</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
