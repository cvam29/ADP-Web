import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Users, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";
import type { EventDto } from "@/services/generated";

const EXPORT_API_BASE =
  process.env.NEXT_PUBLIC_EXPORT_API_URL || "https://api-adp.azure-api.net/api";

/* ✅ Required for static export */
export const dynamic = "force-static";
export const dynamicParams = false;

/* ✅ Build-time route generation */
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${EXPORT_API_BASE}/events/slugs`,
      { cache: "force-cache" },
    );

    if (!res.ok) {
      console.error("Failed to fetch event slugs:", res.status);
      return [];
    }

    const json = await res.json();

    // ✅ GUARANTEED array normalization
    const slugsArray = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.items)
          ? json.items
          : [];

    if (!Array.isArray(slugsArray)) {
      console.error("Event slugs response is not an array:", json);
      return [];
    }

    return slugsArray
      .filter((s) => s && typeof s.url === "string" && s.url.trim().length > 0)
      .map((s) => ({
        url: s.url,
      }));
  } catch (err) {
    console.error("generateStaticParams failed:", err);
    return [];
  }
}

/* ✅ Build-time data fetch */
async function getEvent(url: string): Promise<EventDto | null> {
  try {
    const res = await fetch(
      `${EXPORT_API_BASE}/events/by-url/${encodeURIComponent(url)}`,
      { cache: "force-cache" },
    );

    if (!res.ok) return null;

    const json = await res.json();
    return (json?.data ?? json) as EventDto;
  } catch {
    return null;
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  const e = await getEvent(url);

  if (!e) notFound();

  const price =
    typeof e.price === "number"
      ? e.price
      : Number.parseFloat(e.price || "0") || 0;

  const isEventPast = e.date
    ? new Date(e.date).getTime() < new Date().setHours(0, 0, 0, 0)
    : false;

  const isEventFull =
    typeof e.capacity === "number" &&
    typeof e.registered === "number" &&
    e.registered >= e.capacity;

  return (
    <div className="container py-0">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-b-2xl py-12 px-4 -mx-4">
        <div className="max-w-5xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{e.title}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-slate-700">
              {e.date && (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {e.date}
                </span>
              )}
              {e.time && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {e.time}
                </span>
              )}
              {e.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {e.location}
                </span>
              )}
              {e.type && <Badge variant="secondary">{e.type}</Badge>}
              <Badge variant="secondary">
                {price > 0 ? formatCurrency(price) : "Free"}
              </Badge>
              {typeof e.capacity === "number" &&
                typeof e.registered === "number" && (
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {e.registered}/{e.capacity}
                  </span>
                )}
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href="/events">Back to events</Link>
          </Button>
        </div>
      </section>

      {/* Body */}
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {(e.images?.length ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {e.images?.map((img, i) => (
                      <Image
                        key={img + i}
                        src={img}
                        alt={`${e.title || "Event"} image ${i + 1}`}
                        width={320}
                        height={192}
                        unoptimized
                        className="h-28 w-full object-cover rounded border"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>About this event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                  {e.description}
                </p>
              </CardContent>
            </Card>

            {/* Speakers */}
            {(e.speakers?.length ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Speakers</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {e.speakers?.map((s, i) => (
                    <div
                      key={s.id || i}
                      className="border rounded-xl p-5 text-center"
                    >
                      <Avatar className="h-20 w-20 mx-auto mb-3">
                        <AvatarFallback>
                          {(s.name?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-semibold">{s.name || s.email}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle>Event summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    {price > 0 ? formatCurrency(price) : "Free"}
                  </span>
                </div>

                <Separator className="my-4" />

                {!isEventPast ? (
                  isEventFull ? (
                    <Button disabled className="w-full">
                      Event full
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Registration coming soon
                    </Button>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This event has already occurred.
                  </p>
                )}
              </CardContent>
            </Card>

            {(e.recording || e.recordingUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-4 w-4" /> Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {e.recordingUrl ? (
                    <a
                      href={e.recordingUrl}
                      target="_blank"
                      className="text-primary underline"
                    >
                      Watch recording
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Recording available
                    </span>
                  )}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
