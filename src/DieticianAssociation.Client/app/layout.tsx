import type React from "react"
import type { Metadata, Viewport } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.adp.org.in"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Association of Dietetics Professionals",
    template: "%s | Association of Dietetics Professionals",
  },
  description:
    "Professional development, continuing education, and networking for dietetics professionals in India. Access resources, events, certifications, and academic programs.",
  keywords: [
    "association of dietetics professionals india",
    "dietician association",
    "dietetics association",
    "dietitian association",
    "dietetics professionals",
    "dietetics india",
    "dietetics",
    "nutrition",
    "dietitian",
    "dietician",
    "dietitians",
    "dieticians",
    "nutritionist",
    "professional development",
    "continuing education",
    "clinical nutrition",
    "ADP India",
    "dietetics association India membership"
  ],
  authors: [{ name: "Association of Dietetics Professionals" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Association of Dietetics Professionals",
    title: "Association of Dietetics Professionals",
    description:
      "Professional development, continuing education, and networking for dietetics professionals in India.",
    images: [{ url: "/ADP.jpg", width: 1200, height: 630, alt: "ADP Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Association of Dietetics Professionals",
    description:
      "Professional development, continuing education, and networking for dietetics professionals in India.",
    images: ["/ADP.jpg"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Association of Dietetics Professionals",
    url: SITE_URL,
    logo: `${SITE_URL}/ADP.jpg`,
    description:
      "Professional development, continuing education, and networking for dietetics professionals in India.",
    sameAs: [
      process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/adp.org.in",
      process.env.NEXT_PUBLIC_TWITTER_URL || "https://x.com/adp_org_in",
      process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/company/adp-org-in/",
      process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@adp_org_in",
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/adp.org.in/",
    ],
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Association of Dietetics Professionals",
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: "Association of Dietetics Professionals",
      url: SITE_URL,
      logo: `${SITE_URL}/ADP.jpg`,
    },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://adpblobstorage.blob.core.windows.net" />
        <link rel="dns-prefetch" href="https://adpblobstorage.blob.core.windows.net" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <RoleBasedLayout>{children}</RoleBasedLayout>
          </AuthProvider>
          <Toaster /> {/* 👈 required */}
          <WebVitals />
        </ThemeProvider>
      </body>
    </html>
  )
}
