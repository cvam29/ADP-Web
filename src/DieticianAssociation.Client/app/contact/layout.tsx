import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Association of Dietetics Professionals — reach out for inquiries, support, or feedback.",
  openGraph: {
    title: "Contact Us | Association of Dietetics Professionals",
    description:
      "Get in touch with the Association of Dietetics Professionals — reach out for inquiries, support, or feedback.",
  },
  alternates: { canonical: "/contact/" },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
