import { BookOpen, Users, Award, Briefcase, Calendar, Globe } from "lucide-react"

const benefits = [
  {
    icon: BookOpen,
    title: "Extensive Resource Library",
    description: "Access thousands of research papers, meal plans, clinical guidelines, and professional tools.",
  },
  {
    icon: Users,
    title: "Professional Networking",
    description: "Connect with dietitians nationwide through our member directory and networking events.",
  },
  {
    icon: Award,
    title: "Continuing Education",
    description: "Earn CE credits through webinars, conferences, and online courses to maintain your credentials.",
  },
  {
    icon: Briefcase,
    title: "Career Development",
    description: "Access job boards, career coaching, and professional development resources.",
  },
  {
    icon: Calendar,
    title: "Exclusive Events",
    description: "Attend member-only webinars, conferences, and workshops with industry leaders.",
  },
  {
    icon: Globe,
    title: "National Community",
    description: "Join a community of nutrition professionals across India sharing knowledge and best practices.",
  },
]

export function MembershipBenefits() {
  return (
    <section className="py-24 bg-secondary/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Why Join</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Membership Benefits</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover the comprehensive benefits that come with your membership and how they can advance your career.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="group flex gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors duration-150"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-150">
                  <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-150" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
