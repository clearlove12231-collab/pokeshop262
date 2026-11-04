import type { CSSProperties } from "react";

/** Fill per star (5 stars), floored to the nearest quarter like the source (4.8 → 4¾). */
export function starFills(avg: number): string[] {
  return Array.from({ length: 5 }, (_, i) => {
    const part = Math.max(0, Math.min(1, avg - i));
    return `${Math.floor(part * 4) * 25}%`;
  });
}

/** The source's `.sst-rs-stars` row (5 glyph stars filled through `--f`). */
export function RsStars({ avg, label }: { avg: number; label: string }) {
  return (
    <span className="sst-rs-stars" role="img" aria-label={label}>
      {starFills(avg).map((f, i) => (
        <i key={i} className="sst-rs-star" style={{ "--f": f } as CSSProperties} />
      ))}
    </span>
  );
}
