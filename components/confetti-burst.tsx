"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

const COLORS = ["#0D9488", "#CCFBF1", "#12141A", "#F5F7FA", "#667085"];

function fireBurst() {
  const defaults = {
    startVelocity: 32,
    spread: 360,
    ticks: 90,
    zIndex: 80,
    colors: COLORS,
  };

  confetti({
    ...defaults,
    particleCount: 100,
    origin: { x: 0.2, y: 0.35 },
  });
  confetti({
    ...defaults,
    particleCount: 100,
    origin: { x: 0.8, y: 0.35 },
  });
}

/** One-shot confetti when `active` is true (e.g. payment confirmed). */
export function ConfettiBurst({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setTimeout(() => {
      fireBurst();
    }, 160);
    return () => window.clearTimeout(timer);
  }, [active]);

  return null;
}
