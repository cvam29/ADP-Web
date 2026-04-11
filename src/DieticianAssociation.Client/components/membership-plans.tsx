"use client";

import PageLoading from "@/components/page-loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useMembershipStore } from "@/store/useMembershipStore";
import type { MembershipPlanDto } from "@/services/generated";

const GST_RATE = 0.18;

function getTierAccent(tier: number): { ring: string; badge: string; icon: string } {
  switch (tier) {
    case 0: return { ring: "border-border", badge: "bg-secondary text-foreground", icon: "bg-secondary text-foreground" };
    case 1: return { ring: "border-primary/40", badge: "bg-primary text-primary-foreground", icon: "bg-primary/10 text-primary" };
    case 2: return { ring: "border-accent/40", badge: "bg-accent text-accent-foreground", icon: "bg-accent/10 text-accent" };
    default: return { ring: "border-border", badge: "bg-secondary text-foreground", icon: "bg-secondary text-foreground" };
  }
}

function getTierDescription(tier: number): string {
  switch (tier) {
    case 0: return "Perfect for nutrition students and recent graduates";
    case 1: return "Comprehensive membership for practicing dietitians";
    case 2: return "Premium membership with exclusive benefits";
    default: return "Professional membership for dietitians";
  }
}

export function MembershipPlans() {
  const { memberships: plans, loading, error, fetchMemberships } = useMembershipStore();

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const SectionHeader = () => (
    <div className="text-center mb-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pricing</p>
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Choose Your Membership Plan</h2>
      <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Select the membership tier that best fits your career stage and professional goals.
      </p>
    </div>
  );

  if (loading) {
    return (
      <section className="py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <SectionHeader />
          <PageLoading minHeightClassName="py-12" direction="column" iconClassName="h-8 w-8 text-primary" message="Loading membership plans..." textClassName="text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <SectionHeader />
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchMemberships()} variant="outline">Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  const getTierName = (tier?: number) => {
    switch (tier) {
      case 0: return "Student";
      case 1: return "Professional";
      case 2: return "Premium";
      default: return "Member";
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration || duration <= 0) return "duration";
    if (duration > 60) return "Lifetime";
    const years = duration / 12;
    if (years >= 1) {
      const wholeYears = Number.isInteger(years) ? years : +years.toFixed(1);
      return `${wholeYears} year${wholeYears === 1 ? "" : "s"}`;
    }
    return "<1 year";
  };

  const orderedPlans: MembershipPlanDto[] = (() => {
    const base = [...(plans ?? [])];
    base.sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99));
    const popularIndex = base.findIndex((p) => p.popular);
    if (popularIndex === -1) return base;
    const [popularPlan] = base.splice(popularIndex, 1);
    base.splice(1, 0, popularPlan);
    return base;
  })();

  return (
    <section className="py-24 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <SectionHeader />

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {orderedPlans.map((plan) => {
            const price = plan.price ?? 0;
            const priceWithGST = +(plan.priceWithGST ?? price * (1 + GST_RATE)).toFixed(2);
            const accent = getTierAccent(plan.tier ?? -1);
            const description = getTierDescription(plan.tier ?? -1);
            const isPopular = !!plan.popular;

            return (
              <div key={plan.id ?? plan.name ?? Math.random().toString(36)} className={`relative ${isPopular ? "md:-mt-4" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      <Zap className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}
                <Card className={`border-2 ${isPopular ? accent.ring + " shadow-lg shadow-primary/10" : "border-border"} bg-card rounded-2xl transition-colors duration-150 hover:border-primary/30`}>
                  <CardHeader className="text-center pb-6 pt-8">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${accent.icon} mx-auto mb-4`}>
                      <span className="text-xs font-bold">{getTierName(plan.tier)[0]}</span>
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {plan.name ?? "Membership"}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm mt-1">
                      {description}
                    </CardDescription>
                    <div className="mt-6 space-y-1">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-foreground">{formatCurrency(price)}</span>
                        <span className="text-sm text-muted-foreground">/{formatDuration(plan.duration ?? undefined)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">+ GST 18% = {formatCurrency(priceWithGST)}</p>
                      <Badge variant="outline" className="text-xs rounded-full mt-2 border-border text-muted-foreground">
                        {getTierName(plan.tier)} tier
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 pb-8">
                    <ul className="space-y-2.5">
                      {(plan.features ?? []).map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.id ? (
                      <Button
                        asChild
                        className={`w-full rounded-full ${isPopular ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
                        variant={isPopular ? "default" : "outline"}
                        size="lg"
                      >
                        <Link href="/membership/join">Join Now</Link>
                      </Button>
                    ) : (
                      <Button className="w-full rounded-full" size="lg" disabled variant="outline">
                        Join Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">Need help choosing? We&apos;re happy to assist.</p>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
