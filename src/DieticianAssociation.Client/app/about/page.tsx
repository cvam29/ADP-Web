import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Target, Award, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about the Association of Dietetics Professionals — our mission, leadership, and commitment to advancing dietetics in India.",
  openGraph: {
    title: "About Us | Association of Dietetics Professionals",
    description:
      "Learn about the Association of Dietetics Professionals — our mission, leadership, and commitment to advancing dietetics in India.",
  },
  alternates: { canonical: "/about/" },
}

const leadership = [
  {
    name: "Ravi Kumar",
    role: "President",
    credentials: "PhD Scholar, MSc, CDE",
    image: "https://adpblobstorage.blob.core.windows.net/adpcontainer/Memebers/Ravi_Professional_Picture_1f731f6491.png?height=200&width=200",
    bio: "H.O.D., Government Hospital Dietetics Department, and AIIMS Researcher; T1DM Specialist with 7+ years of experience.",
  },
  {
    name: "Lt. Col. Laicy Fernandez (Retd.)",
    role: "Vice President",
    credentials: "MSc, PGDAND",
    image: "https://adpblobstorage.blob.core.windows.net/adpcontainer/Memebers/Laicy.jpg?height=200&width=200",
    bio: "Retired Lt. Col. from Indian Army. Founder Eden's Way nutritional consultation with 15+ years of experience.",
  },
  {
    name: "Deepak Kumar",
    role: "General Secretary",
    credentials: "MSc/MSME Trainer",
    image: "https://adpblobstorage.blob.core.windows.net/adpcontainer/Memebers/Deepak.jpg?height=200&width=200",
    bio: "Entrepreneur, Food technologist, and MSME trainer with 7+ years of industry experience.",
  },
  {
    name: "Rasneet Kaur",
    role: "Treasurer",
    credentials: "PhD Scholar, MSc, CDE",
    image: "https://adpblobstorage.blob.core.windows.net/adpcontainer/Memebers/Rasneet.jpg?height=200&width=200",
    bio: "A Subject Matter Expert having 7+ years of experience working in MNC's as well as Startups.",
  },
]

const milestones = [
  {
    year: "2025",
    title: "Association Founded",
    description: "Established in New Delhi to advance the profession of dietetics and nutrition in India.",
  },
  {
    year: "CS",
    title: "First National Conference",
    description: "Coming Soon..",
  },
  {
    year: "CS",
    title: "Online Resources Launch",
    description: "Coming Soon..",
  },
]

const values = [
  { icon: Target, label: "Excellence", sub: "In practice and education" },
  { icon: Users, label: "Community", sub: "Supporting each other" },
  { icon: Award, label: "Innovation", sub: "Advancing the field" },
  { icon: Calendar, label: "Growth", sub: "Continuous learning" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-secondary/30 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Who We Are
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 text-balance">
              About Our Association
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {(process.env.NEXT_PUBLIC_WEBSITE_NAME || "Association of Dietetics Professionals")} is India&rsquo;s fresh voice for dietetics,
              uniting professionals nationwide. Our mission is clear: to safeguard the rights and advance the welfare
              of every dietitian, while rigorously fostering cutting-edge research that transforms lives.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Our Purpose
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">Our Mission</h2>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                To empower nutrition professionals across India through education, research, advocacy, and community
                support, ultimately improving the health and well-being of Indian families and communities.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/30 hover:border-primary/30 transition-colors duration-150">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{label}</div>
                      <div className="text-xs text-muted-foreground">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://adpblobstorage.blob.core.windows.net/adpcontainer/Assets/AboutUs_600_x_500_px_07ef852081.png"
                alt="Indian nutrition professionals collaborating"
                width={600}
                height={400}
                className="rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-24 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              The Team
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Leadership Team</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Our board of directors brings decades of experience in nutrition science, clinical practice, and
              professional leadership across India.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader, index) => (
              <Card
                key={index}
                className="group border-border bg-card hover:border-primary/30 transition-colors duration-150 rounded-2xl overflow-hidden"
              >
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="relative mx-auto mb-4 h-[110px] w-[110px]">
                    <Image
                      src={leader.image || "/placeholder.svg"}
                      alt={leader.name}
                      fill
                      className="rounded-full object-cover ring-2 ring-border"
                    />
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground">{leader.name}</CardTitle>
                  <div className="space-y-1.5">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs font-medium rounded-full px-3">
                      {leader.role}
                    </Badge>
                    <CardDescription className="font-medium text-xs text-muted-foreground">
                      {leader.credentials}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Milestones
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Our Journey</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              From our founding to today, we&rsquo;ve continuously evolved to serve the nutrition profession and advance
              public health across India.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-10">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className="shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm z-10">
                      {milestone.year.slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{milestone.title}</h3>
                        <Badge variant="outline" className="text-xs rounded-full border-border text-muted-foreground">
                          {milestone.year}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Get Involved
          </p>
          <h2 className="text-3xl font-bold text-background mb-4 tracking-tight text-balance">
            Join Our Mission
          </h2>
          <p className="text-muted text-base mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "hsl(var(--background) / 0.6)" }}>
            Be part of a community that&rsquo;s shaping the future of nutrition and dietetics in India.
            Together, we can make a lasting impact on public health across the nation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              <Link href="/membership">Become a Member</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-background/20 text-background hover:bg-background/10 px-8">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
