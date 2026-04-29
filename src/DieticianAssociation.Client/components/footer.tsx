"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { FaFacebook, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { memberResourceNav } from "@/lib/member-access";
import { publicNavigation } from "../lib/site-navigation";

const socialLinks = [
  { Icon: FaFacebook,  href: process.env.NEXT_PUBLIC_FACEBOOK_URL  || "https://www.facebook.com/adp.org.in",                    label: "Facebook" },
  { Icon: FaXTwitter,  href: process.env.NEXT_PUBLIC_TWITTER_URL   || "https://x.com/adp_org_in",                               label: "X / Twitter" },
  { Icon: FaLinkedin,  href: process.env.NEXT_PUBLIC_LINKEDIN_URL  || "https://www.linkedin.com/company/adp-org-in/",            label: "LinkedIn" },
  { Icon: FaYoutube,   href: process.env.NEXT_PUBLIC_YOUTUBE_URL   || "https://www.youtube.com/@adp_org_in",                    label: "YouTube" },
  { Icon: FaInstagram, href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/adp.org.in/",                  label: "Instagram" },
]

export function Footer() {
  const memberResourceLinks = [
    { label: "Login Portal", href: "/login" },
    ...memberResourceNav.map((item) => ({ label: item.label, href: item.href })),
  ]
  const quickLinks = publicNavigation.filter((item) => item.href !== "/")

  return (
    <footer className="bg-herb-950 dark:bg-card border-t border-herb-900 dark:border-border">
      <div className="container mx-auto px-4 lg:px-6">

        {/* Main grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 py-16">

          {/* Brand column — full width on mobile */}
          <div className="col-span-2 lg:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/ADP.svg"
                alt="ADP logo"
                width={36}
                height={36}
                className="rounded-lg transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-semibold text-sm text-herb-100 leading-tight max-w-[160px]">
                {process.env.NEXT_PUBLIC_WEBSITE_NAME || "Association of Dietetics Professionals"}
              </span>
            </Link>

            <p className="text-herb-400 text-sm leading-relaxed max-w-xs">
              Empowering nutrition professionals across India through education, research, and professional community.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-herb-800/60 hover:bg-herb-700 flex items-center justify-center text-herb-400 hover:text-herb-100 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-herb-500 uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-herb-400 hover:text-herb-100 text-sm transition-colors duration-150 inline-flex items-center gap-1 group"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Member Resources */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-herb-500 uppercase tracking-widest">Member Resources</h3>
            <ul className="space-y-2">
              {memberResourceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-herb-400 hover:text-herb-100 text-sm transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-herb-500 uppercase tracking-widest">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:info@adp.org.in"
                className="flex items-center gap-2.5 text-herb-400 hover:text-herb-100 text-sm transition-colors duration-150 group"
              >
                <Mail className="w-3.5 h-3.5 text-herb-600 group-hover:text-herb-400 flex-shrink-0" />
                info@adp.org.in
              </a>
              <a
                href="tel:+918059655000"
                className="flex items-center gap-2.5 text-herb-400 hover:text-herb-100 text-sm transition-colors duration-150 group"
              >
                <Phone className="w-3.5 h-3.5 text-herb-600 group-hover:text-herb-400 flex-shrink-0" />
                +91 80596 55000
              </a>
              <a
                href="https://maps.google.com/?q=RZ-96,+UG+FLOOR,+UTTAM+NAGAR,+NEW+DELHI-110059"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-herb-400 hover:text-herb-100 text-sm transition-colors duration-150 group"
                title="View on Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-herb-600 group-hover:text-herb-400 flex-shrink-0 mt-0.5" />
                <address className="not-italic leading-relaxed">New Delhi — 110059</address>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-herb-900 dark:border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-herb-700 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} Association of Dietetics Professionals. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Accessibility"].map((label, i) => (
              <Link
                key={label}
                href={`/${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-herb-600 hover:text-herb-300 text-xs transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
