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
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useMembershipStore } from "@/store/useMembershipStore";
import type { MembershipPlanDto } from "@/services/generated";

const GST_RATE = 0.18;

function getTierColor(tier: number): string {
  switch (tier) {
    case 0:
      return "border-green-200";
    case 1:
      return "border-blue-200";
    case 2:
      return "border-purple-200";
    default:
      return "border-gray-200";
  }
}

function getTierDescription(tier: number): string {
  switch (tier) {
    case 0:
      return "Perfect for nutrition students and recent graduates";
    case 1:
      return "Comprehensive membership for practicing dieticians";
    case 2:
      return "Premium membership with exclusive benefits";
    default:
      return "Professional membership for dieticians";
  }
}

export function MembershipPlans() {
  const {
    memberships: plans,
    loading,
    error,
    fetchMemberships,
  } = useMembershipStore();

  useEffect(() => {
    // Load membership plans via store on mount
    fetchMemberships();
  }, [fetchMemberships]);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Choose Your Membership Plan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select the membership tier that best fits your career stage and
              professional goals.
            </p>
          </div>
          <PageLoading
            minHeightClassName="py-12"
            direction="column"
            iconClassName="h-8 w-8 text-blue-500"
            message="Loading membership plans..."
            textClassName="text-slate-600"
          />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Choose Your Membership Plan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select the membership tier that best fits your career stage and
              professional goals.
            </p>
          </div>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchMemberships()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Helpers moved locally to avoid missing imports
  const getTierName = (tier?: number) => {
    switch (tier) {
      case 0:
        return "Student";
      case 1:
        return "Professional";
      case 2:
        return "Premium";
      default:
        return "Member";
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration || duration <= 0) return "duration";
    // Assume duration in months; convert to years and cap long terms as lifetime
    if (duration > 60) return "Lifetime";
    const years = duration / 12;
    if (years >= 1) {
      const wholeYears = Number.isInteger(years) ? years : +years.toFixed(1);
      return `${wholeYears} year${wholeYears === 1 ? "" : "s"}`;
    }
    return "<1 year";
  };

  // Ensure we always show the most popular plan in the middle of the first row (index 1)
  const orderedPlans: MembershipPlanDto[] = (() => {
    const base = [...(plans ?? [])];
    // Sort by tier for a sensible default order
    base.sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99));
    const popularIndex = base.findIndex((p) => p.popular);
    if (popularIndex === -1) return base;
    const [popularPlan] = base.splice(popularIndex, 1);
    base.splice(1, 0, popularPlan);
    return base;
  })();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Choose Your Membership Plan
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select the membership tier that best fits your career stage and
            professional goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {orderedPlans.map((plan) => {
            const price = plan.price ?? 0;
            const priceWithGST = +(
              plan.priceWithGST ?? price * (1 + GST_RATE)
            ).toFixed(2);
            const tierColor = getTierColor(plan.tier ?? -1);
            const description = getTierDescription(plan.tier ?? -1);

            return (
              <Card
                key={plan.id ?? plan.name ?? Math.random().toString(36)}
                className={`relative ${tierColor} ${plan.popular ? "ring-2 ring-blue-500 md:scale-105" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">
                    {plan.name ?? "Membership"}
                  </CardTitle>
                  <CardDescription className="text-slate-600 mb-4">
                    {description}
                  </CardDescription>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl sm:text-4xl font-bold text-slate-900">
                      {formatCurrency(price)}
                      <span className="text-lg font-normal text-slate-500">
                        /{formatDuration(plan.duration ?? undefined)}
                      </span>
                    </span>
                    <span className="text-base text-slate-700">
                      + GST (18%) = {formatCurrency(priceWithGST)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {getTierName(plan.tier)} tier
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {(plan.features ?? []).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id ? (
                    <>
                      {/* <Button asChild className="w-full" size="lg">
                        <Link href={`/register?plan=${plan.id}`}>
                          Get Started
                        </Link>
                      </Button> */}

                      <Button asChild className="w-full" size="lg">
                        <Link href={`/membership/join`}>Join Now</Link>
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      Get Started
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
