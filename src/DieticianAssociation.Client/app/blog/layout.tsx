import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest articles, research insights, and professional updates from the dietetics community.",
  openGraph: {
    type: "website",
    title: "Blog | Association of Dietetics Professionals",
    description:
      "Read the latest articles, research insights, and professional updates from the dietetics community.",
    url: "/blog",
  },
  alternates: { canonical: "/blog" },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
