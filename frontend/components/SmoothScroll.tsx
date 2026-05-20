"use client";

import { useEffect, useRef } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scroll: InstanceType<typeof import("locomotive-scroll").default> | null = null;

    import("locomotive-scroll").then((mod) => {
      const LocomotiveScroll = mod.default;
      scroll = new LocomotiveScroll();
    });

    return () => {
      scroll?.destroy();
    };
  }, []);

  return (
    <div data-scroll-container ref={containerRef}>
      {children}
    </div>
  );
}
