"use client";

import { useEffect, useState } from "react";

const generateLevel = (i: number): number => {
  const v = (Math.sin(i * 11.3) * Math.cos(i * 7.1) + 1) / 2;
  if (v > 0.88) return 4;
  if (v > 0.72) return 3;
  if (v > 0.52) return 2;
  if (v > 0.32) return 1;
  return 0;
};

export const HeatmapBackground = () => {
  const [cols, setCols] = useState(52);

  useEffect(() => {
    const update = () => {
      setCols(window.innerWidth < 640 ? 20 : window.innerWidth < 1024 ? 36 : 52);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const ROWS = 7;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          display: "flex",
          alignItems: "flex-start",
          padding: "40px 16px",
        }}
      >
        <div style={{ display: "flex", gap: "3px", width: "100%" }}>
          {Array.from({ length: cols }).map((_, col) => (
            <div
              key={col}
              style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}
            >
              {Array.from({ length: ROWS }).map((_, row) => {
                const i = col * ROWS + row;
                const level = generateLevel(i);
                return (
                  <div
                    key={i}
                    className="dark-cell"
                    style={{ borderRadius: "2px", aspectRatio: "1", width: "100%" }}
                    data-level={level}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stronger fade-out on mobile so cells don't compete with content */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--bg) 35%, var(--bg) 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--bg) 60%, var(--bg) 100%)",
        }}
      />
    </div>
  );
};
