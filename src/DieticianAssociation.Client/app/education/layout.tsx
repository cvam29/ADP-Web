import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education & Academics",
  description:
    "Explore accredited dietetics colleges, academic programs, and continuing education opportunities across India.",
  openGraph: {
    title: "Education & Academics | Association of Dietetics Professionals",
    description:
      "Explore accredited dietetics colleges, academic programs, and continuing education opportunities across India.",
  },
  alternates: { canonical: "/education/" },
};

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}