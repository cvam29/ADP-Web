import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Award, Briefcase, Calendar, Globe } from "lucide-react"

const benefits = [
  {
    icon: BookOpen,
    title: "Extensive Resource Library",
    description: "Access thousands of research papers, meal plans, clinical guidelines, and professional tools.",
    color: "text-emerald-600",
  },
  {
    icon: Users,
    title: "Professional Networking",
    description: "Connect with dieticians worldwide through our member directory and networking events.",
    color: "text-blue-600",
  },
  {
    icon: Award,
    title: "Continuing Education",
    description: "Earn CE credits through webinars, conferences, and online courses to maintain your credentials.",
    color: "text-purple-600",
  },
  {
    icon: Briefcase,
    title: "Career Development",
    description: "Access job boards, career coaching, and professional development resources.",
    color: "text-amber-600",
  },
  {
    icon: Calendar,
    title: "Exclusive Events",
    description: "Attend member-only webinars, conferences, and workshops with industry leaders.",
    color: "text-red-600",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Join a worldwide community of nutrition professionals sharing knowledge and best practices.",
    color: "text-teal-600",
  },
]

export function MembershipBenefits() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Membership Benefits</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the comprehensive benefits that come with your membership and how they can advance your career.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
