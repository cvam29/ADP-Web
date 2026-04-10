import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
    return (
        <section className="relative bg-gradient-to-br from-emerald-50 to-blue-50 py-20 lg:py-32">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                                Empowering Nutrition
                                <span className="text-emerald-600"> Professionals</span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                Join our community of registered dieticians and nutritionists dedicated to advancing the science of
                                nutrition and improving public health.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                            <Link href="/membership/join">Join Now</Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                            >
                                <Link href="/about">Learn More</Link>
                            </Button>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span>Nutrition Advocacy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Accredited Programs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span>Continuing Education</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <Image
                            src="https://adpblobstorage.blob.core.windows.net/adpcontainer/Assets/Adp_homepage_new_4e43aea799.jpeg"
                            alt="Nutrition professionals collaborating"
                            width={600}
                            height={600}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="rounded-2xl shadow-2xl"
                            priority
                        />
                        <div className="hidden sm:block absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                            <div className="text-2xl font-bold text-emerald-600">98%</div>
                            <div className="text-sm text-slate-600">Member Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}