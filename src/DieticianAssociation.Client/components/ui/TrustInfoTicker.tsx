"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * TrustInfoTicker
 * ------------------------------------------------------------
 * A refined, professional horizontal ticker for displaying
 * official credentials, registrations, and important links.
 * Designed for government bodies, associations, and institutions.
 */
export default function TrustInfoTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationFrame: number;
    let position = 0;
    const SPEED = 0.15; // calm, premium motion

    const animate = () => {
      if (!isPaused) {
        position -= SPEED;
        if (Math.abs(position) >= track.scrollWidth / 2) {
          position = 0; // seamless infinite loop
        }
        track.style.transform = `translateX(${position}px)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused]);

  const items = [
    { label: "Org Registration No", value: "S/RS/SW/HQ/092/2025" },
    { label: "Important Guidelines", link: "/guidelines" },
    { label: "DARPAN ID", value: "DL/2025/0736657" },
    { label: "Important Guidelines", link: "/guidelines" },
  ];

  return (
    <section
      aria-label="Official credentials and important links"
      className="relative w-full overflow-hidden border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient Fade — Left */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent" />

      {/* Gradient Fade — Right */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent" />

      <div className="relative flex whitespace-nowrap">
        <div
          ref={trackRef}
          className="flex items-center gap-12 px-8 py-3 text-sm will-change-transform"
        >
          {[...items, ...items].map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              {item.link ? (
                <Link
                  href={item.link}
                  className="font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline underline-offset-4"
                >
                  {item.label}
                </Link>
              ) : (
                <>
                  <span className="text-zinc-500 dark:text-zinc-400">{item.label}:</span>
                  <span className="font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
                    {item.value}
                  </span>
                </>
              )}

              <span className="mx-6 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
