"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { memberResourceNav } from "@/lib/member-access";
import { publicNavigation } from "../lib/site-navigation";

export function Footer() {
  const memberResourceLinks = [
    { label: "Login Portal", href: "/login" },
    ...memberResourceNav.map((item) => ({
      label: item.label,
      href: item.href,
    })),
  ];
  const quickLinks = publicNavigation.filter((item) => item.href !== "/");

  return (
    <footer className="bg-herb-950 text-herb-50 border-t border-herb-800">
      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image
                  src="/ADP.svg"
                  alt="Association of Dietetics Professionals logo"
                  width={32}
                  height={32}
                  className="object-cover rounded-lg"
                />
              </div>
              <span className="font-semibold text-base text-herb-100">
                {process.env.NEXT_PUBLIC_WEBSITE_NAME ||
                  "Association of Dietetics Professionals"}
              </span>
            </div>
            <p className="text-herb-400 text-sm leading-relaxed">
              Empowering nutrition professionals across India through education,
              resources, and community support.
            </p>
            <div className="flex space-x-4">
              <Link
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/adp.org.in"}
                className="text-herb-500 hover:text-herb-100 transition-colors duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook className="w-4 h-4" />
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_TWITTER_URL || "https://x.com/adp_org_in"}
                className="text-herb-500 hover:text-herb-100 transition-colors duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter className="w-4 h-4" />
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/company/adp-org-in/"}
                className="text-herb-500 hover:text-herb-100 transition-colors duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin className="w-4 h-4" />
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@adp_org_in"}
                className="text-herb-500 hover:text-herb-100 transition-colors duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube className="w-4 h-4" />
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/adp.org.in/"}
                className="text-herb-500 hover:text-herb-100 transition-colors duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-herb-400 uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-herb-500 hover:text-herb-100 transition-colors duration-150 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Member Resources */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-herb-400 uppercase tracking-widest">Member Resources</h3>
            <ul className="space-y-2.5">
              {memberResourceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-herb-500 hover:text-herb-100 transition-colors duration-150 text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-herb-400 uppercase tracking-widest">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-herb-500 flex-shrink-0" />
                <a
                  href="mailto:info@adp.org.in"
                  className="text-herb-500 text-sm hover:text-herb-100 transition-colors duration-150"
                >
                  info@adp.org.in
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-herb-500 flex-shrink-0" />
                <a
                  href="tel:+918059655000"
                  className="text-herb-500 text-sm hover:text-herb-100 transition-colors duration-150"
                >
                  +91 80596 55000
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <a
                  href="https://maps.google.com/?q=RZ-96, UG FLOOR, UTTAM NAGAR, NEW DELHI-110059"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 group"
                  title="View on Google Maps"
                >
                  <MapPin className="w-4 h-4 text-herb-500 mt-0.5 flex-shrink-0 group-hover:text-herb-100 transition-colors duration-150" />
                  <address className="not-italic text-herb-500 text-sm leading-relaxed group-hover:text-herb-100 transition-colors duration-150">
                    <span className="block">New Delhi - 110059</span>
                  </address>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-herb-800/60 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-herb-600 text-sm">
              &copy; {new Date().getFullYear()}{" "}
              {process.env.NEXT_PUBLIC_WEBSITE_NAME || "Association of Dietetics Professionals"}. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-herb-500 hover:text-herb-300 text-sm transition-colors duration-150">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-herb-500 hover:text-herb-300 text-sm transition-colors duration-150">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-herb-500 hover:text-herb-300 text-sm transition-colors duration-150">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
