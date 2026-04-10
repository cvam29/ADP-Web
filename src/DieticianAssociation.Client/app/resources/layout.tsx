import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Access professional resources, guidelines, templates, and tools for dietetics practice and education.",
  openGraph: {
    title: "Resources | Association of Dietetics Professionals",
    description:
      "Access professional resources, guidelines, templates, and tools for dietetics practice and education.",
  },
  alternates: { canonical: "/resources/" },
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children
}
