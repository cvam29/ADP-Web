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
        bio: "Retired Lt. Col. from Indian Army. Founder Eden's Way nutritional consultation with 15+ years of experience .",
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
        bio: "A Subject Matter Expert having 7+ years of experience working in MNC’s as well as Startups.",
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
    // {
    //    year: "2010",
    //    title: "Multi-State Expansion",
    //    description: "Extended membership across all Indian states and union territories.",
    // },
    // {
    //    year: "2018",
    //    title: "Research Initiative",
    //    description: "Launched major research funding program for Indian nutrition studies.",
    // },
    // {
    //    year: "2024",
    //    title: "Digital Transformation",
    //    description: "Modernized platform with enhanced member services and regional language support.",
    // },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">About Our Association</h1>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            {(process.env.NEXT_PUBLIC_WEBSITE_NAME || "Association of Dietetics Professionals")} is India&rsquo;s fresh voice for dietetics, uniting professionals nationwide.
                            Our mission is clear: to safeguard the rights and advance the welfare of every dietitian,
                            while rigorously fostering cutting-edge research that transforms lives.
                            Together, we are building a robust platform for knowledge, advocacy, and collective growth, ensuring dietitians stand at the forefront of public health.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                To empower nutrition professionals across India through education, research, advocacy, and community
                                support, ultimately improving the health and well-being of Indian families and communities.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <Target className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">Excellence</div>
                                        <div className="text-sm text-slate-600">In practice and education</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">Community</div>
                                        <div className="text-sm text-slate-600">Supporting each other</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Award className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">Innovation</div>
                                        <div className="text-sm text-slate-600">Advancing the field</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">Growth</div>
                                        <div className="text-sm text-slate-600">Continuous learning</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <Image
                                src="https://adpblobstorage.blob.core.windows.net/adpcontainer/Assets/AboutUs_600_x_500_px_07ef852081.png"
                                alt="Indian nutrition professionals collaborating"
                                width={600}
                                height={400}
                                className="rounded-2xl shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Leadership Team</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Our board of directors brings decades of experience in nutrition science, clinical practice, and
                            professional leadership across India.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {leadership.map((leader, index) => (
                            <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="text-center">
                                    <div className="relative mx-auto mb-4 h-[100px] w-[100px] sm:h-[130px] sm:w-[130px]">
                                        <Image
                                            src={leader.image || "/placeholder.svg"}
                                            alt={leader.name}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <CardTitle className="text-xl">{leader.name}</CardTitle>
                                    <div className="space-y-1">
                                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">{leader.role}</Badge>
                                        <CardDescription className="font-medium">{leader.credentials}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 text-center">{leader.bio}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* History Timeline */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Journey</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            From our founding to today, we&rsquo;ve continuously evolved to serve the nutrition profession and advance
                            public health across India.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-emerald-200"></div>

                            <div className="space-y-12">
                                {milestones.map((milestone, index) => (
                                    <div key={index} className="relative flex items-start space-x-6">
                                        <div className="flex-shrink-0 w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {milestone.year.slice(-2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-xl font-bold text-slate-900">{milestone.title}</h3>
                                                <Badge variant="outline">{milestone.year}</Badge>
                                            </div>
                                            <p className="text-slate-600">{milestone.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-emerald-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Join Our Mission</h2>
                    <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                        Be part of a community that&rsquo;s shaping the future of nutrition and dietetics in India. Together, we can make
                        a lasting impact on public health across the nation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/membership">Become a Member</Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/contact">
                                Contact Us
                            </Link>

                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}