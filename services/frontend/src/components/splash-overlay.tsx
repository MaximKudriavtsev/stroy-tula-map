"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadSplashAnimation,
  pickRandomSplashAnimation,
} from "@/animations/registry";

const HOLD_MS = 3000;
const FADE_MS = 500;

type PlayableElement = HTMLElement & { play?: () => void };

type SplashPhase = "visible" | "fading" | "hidden";

export function SplashOverlay() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<SplashPhase>("visible");

  useEffect(() => {
    const host = hostRef.current;
    const animation = pickRandomSplashAnimation();
    let cancelled = false;

    if (host && animation) {
      loadSplashAnimation(animation).then(() => {
        if (cancelled) {
          return;
        }

        const element = document.createElement(animation.tag) as PlayableElement;
        element.style.width = "min(100vw, 1280px)";
        host.replaceChildren(element);
        element.play?.();
      });
    }

    const fadeTimer = setTimeout(() => setPhase("fading"), HOLD_MS);
    const hideTimer = setTimeout(() => setPhase("hidden"), HOLD_MS + FADE_MS);

    return () => {
      cancelled = true;
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") {
    return null;
  }

  const isFading = phase === "fading";

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ease-out ${
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex w-full items-center justify-center" ref={hostRef} />
    </div>
  );
}
