"use client";

import { useEffect, useRef } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scroll: InstanceType<typeof import("locomotive-scroll").default> | null = null;

    import("locomotive-scroll").then((mod) => {
      const LocomotiveScroll = mod.default;
      if (containerRef.current) {
        scroll = new LocomotiveScroll({
          el: containerRef.current,
          smooth: true,
          lerp: 0.08,
          multiplier: 0.9,
        });
      }
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
