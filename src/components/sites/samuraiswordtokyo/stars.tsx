import type { CSSProperties } from "react";

/** Same rule as the source's review-stars script: whole stars, then one 25/50/75% star. */
export function starFills(avg: number): string[] {
  const r = Math.max(0, Math.min(5, avg));
  let full = Math.floor(r + 1e-9);
  let frac = r - full;
  if (frac >= 0.995) {
    full += 1;
    frac = 0;
  }
  const partial = frac > 0.005 ? Math.max(25, Math.min(75, Math.round(frac * 4) * 25)) : 0;
  return Array.from({ length: 5 }, (_, i) => `${i < full ? 100 : i === full ? partial : 0}%`);
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
