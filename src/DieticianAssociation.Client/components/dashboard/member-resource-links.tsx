"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, FlaskConical, LayoutGrid, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { memberResourceNav } from "@/lib/member-access";

const memberResources = [
  {
    title: "Member Directory",
    description: "Browse active ADP members, their professional focus, and organization details.",
    href: "/dashboard/directory",
    icon: Users,
    badge: "Active membership",
    requiredPermission: "member.directory.access",
  },
  {
    title: "Continuing Education",
    description: "Jump to ADP Academics for institutions, programs, and course discovery.",
    href: "/education",
    icon: BookOpen,
    badge: "Academics",
  },
  {
    title: "Career Center",
    description: "Career pathways and placement support are being prepared for members.",
    href: "/dashboard/career",
    icon: Briefcase,
    badge: "Coming soon",
    requiredPermission: "member.career.access",
  },
  {
    title: "Research Library",
    description: "Curated research resources and evidence summaries are on the way.",
    href: "/dashboard/research",
    icon: FlaskConical,
    badge: "Coming soon",
    requiredPermission: "member.research.access",
  },
  {
    title: "Professional Tools",
    description: "Open the member tools hub and generate ADP-branded diet charts client-side.",
    href: "/dashboard/tools",
    icon: LayoutGrid,
    badge: "New tool",
    requiredPermission: "member.tools.access",
  },
];

interface MemberResourceLinksProps {
  showMemberOnlyState?: boolean;
}

export function MemberResourceLinks({
  showMemberOnlyState = false,
}: MemberResourceLinksProps) {
  const { hasPermission } = useAuth();
  const visibleResources = memberResources.filter(
    (resource) => !resource.requiredPermission || hasPermission(resource.requiredPermission),
  );

  return (
    <Card className="border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-slate-50 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl text-slate-900">Member Resource Center</CardTitle>
          <CardDescription className="max-w-2xl text-slate-600">
            Access the member resources currently available to this account.
          </CardDescription>
        </div>
        {showMemberOnlyState && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Active membership required for member-only areas
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {visibleResources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
            No member resources are enabled for this account right now.
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleResources.map((resource) => {
            const Icon = resource.icon;

            return (
              <div
                key={resource.title}
                className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    {resource.badge}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{resource.title}</h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600">
                  {resource.description}
                </p>
                <Button asChild variant="ghost" className="mt-4 px-0 text-emerald-700 hover:bg-transparent hover:text-emerald-800">
                  <Link href={resource.href}>
                    Open resource
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}