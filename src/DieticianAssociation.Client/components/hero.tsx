import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
    return (
        <section className="relative bg-background py-20 lg:py-32 border-b border-border">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Content column */}
                    <div className="space-y-8">
                        {/* Eyebrow label */}
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-secondary border border-border px-3 py-1 rounded-full">
                            India&apos;s Dietetics Community
                        </span>

                        <div className="space-y-5">
                            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight text-balance">
                                Empowering Nutrition{" "}
                                <span className="relative inline-block">
                                    Professionals
                                    <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-accent rounded-full" />
                                </span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                                Join our community of registered dieticians and nutritionists dedicated to advancing the science of
                                nutrition and improving public health.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                                <Link href="/membership/join">Join Now</Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-full border-border text-foreground hover:bg-secondary px-8"
                            >
                                <Link href="/about">Learn More</Link>
                            </Button>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            {["Nutrition Advocacy", "Accredited Programs", "Continuing Education"].map((label) => (
                                <span
                                    key={label}
                                    className="inline-flex items-center gap-1.5 bg-secondary border border-border text-muted-foreground px-3 py-1 rounded-full"
                                >
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
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
                        <div className="hidden sm:flex flex-col absolute -bottom-5 -left-5 bg-card border border-border p-4 rounded-2xl shadow-sm min-w-[120px]">
                            <div className="text-2xl font-bold text-foreground tracking-tight">98%</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Member Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
