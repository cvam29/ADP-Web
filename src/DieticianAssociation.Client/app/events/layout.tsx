import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events",
  description:
    "Discover upcoming conferences, workshops, webinars, and networking events for dietetics professionals.",
  openGraph: {
    title: "Events | Association of Dietetics Professionals",
    description:
      "Discover upcoming conferences, workshops, webinars, and networking events for dietetics professionals.",
  },
  alternates: { canonical: "/events/" },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
