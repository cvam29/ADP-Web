"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

interface MemberResourceComingSoonProps {
  title: string;
  description: string;
}

export function MemberResourceComingSoon({
  title,
  description,
}: MemberResourceComingSoonProps) {
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">{description}</p>
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 flex-shrink-0">
          <Clock3 className="mr-1.5 h-3.5 w-3.5" />
          Coming Soon
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="border-dashed border-emerald-200 bg-emerald-50/50 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">What to expect</CardTitle>
              <CardDescription>
                This member-only section is reserved and linked, but the full experience is still being prepared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>ADP will expand this area with curated workflows, practical templates, and guided resources for active members.</p>
              <p>Until then, the Professional Tools hub and Academics page are already available for immediate use.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 text-white shadow-none">
            <CardHeader>
              <CardTitle className="text-xl text-white">Available now</CardTitle>
              <CardDescription className="text-slate-300">
                Continue with the currently wired member resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasPermission("member.tools.access") ? (
                <Button asChild className="w-full justify-between bg-emerald-500 text-white hover:bg-emerald-400">
                  <Link href="/dashboard/tools">
                    Open Professional Tools
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {hasPermission("member.directory.access") ? (
                <Button asChild variant="outline" className="w-full justify-between border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900 hover:text-white">
                  <Link href="/dashboard/directory">
                    Browse Member Directory
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" className="w-full justify-between border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900 hover:text-white">
                <Link href="/education">
                  Visit Academics
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}