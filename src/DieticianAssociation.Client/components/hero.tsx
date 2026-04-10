import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
    return (
        <section className="relative bg-white dark:bg-zinc-950 py-20 lg:py-32 border-b border-zinc-100 dark:border-zinc-900">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Content column */}
                    <div className="space-y-8">
                        {/* Eyebrow label */}
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-3 py-1 rounded-full">
                            India&apos;s Dietetics Community
                        </span>

                        <div className="space-y-5">
                            <h1 className="text-4xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100 leading-[1.1] tracking-tight text-balance">
                                Empowering Nutrition{" "}
                                <span className="relative inline-block">
                                    Professionals
                                    <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-emerald-500 rounded-full" />
                                </span>
                            </h1>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
                                Join our community of registered dieticians and nutritionists dedicated to advancing the science of
                                nutrition and improving public health.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button asChild size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                                <Link href="/membership/join">Join Now</Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-8"
                            >
                                <Link href="/about">Learn More</Link>
                            </Button>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            {["Nutrition Advocacy", "Accredited Programs", "Continuing Education"].map((label) => (
                                <span
                                    key={label}
                                    className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full"
                                >
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Image column */}
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]">
                            <Image
                                src="https://adpblobstorage.blob.core.windows.net/adpcontainer/Assets/Adp_homepage_new_4e43aea799.jpeg"
                                alt="Nutrition professionals collaborating"
                                width={600}
                                height={600}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="w-full object-cover"
                                priority
                            />
                        </div>
                        {/* Floating stat card */}
                        <div className="hidden sm:flex flex-col absolute -bottom-5 -left-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm min-w-[120px]">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">98%</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Member Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
