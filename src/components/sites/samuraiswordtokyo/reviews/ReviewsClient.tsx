"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { REVIEW_CATEGORIES, type ReviewCategory, type ReviewSort } from "./constants";

const SORT_OPTIONS: [ReviewSort, string][] = [
  ["newest", "최신순"],
  ["photos", "사진 우선"],
  ["high", "별점 높은순"],
  ["low", "별점 낮은순"],
];

/**
 * GET form like the source: choosing an option reloads the list with
 * ?rv_sort=…, keeping the current photo/star filters (hidden inputs).
 */
export function ReviewSortForm({
  category,
  sort,
  photos,
  stars,
}: {
  category: ReviewCategory;
  sort: ReviewSort;
  photos?: boolean;
  stars?: number;
}) {
  const { path, group } = REVIEW_CATEGORIES[category];
  return (
    <form className="sst-rvp-sort" method="get" action={path}>
      <input type="hidden" name="rv_group" value={group} />
      {photos && <input type="hidden" name="rv_photos" value="1" />}
      {stars && <input type="hidden" name="rv_stars" value={stars} />}
      <label htmlFor="sst-rvp-sort">정렬</label>
      <select
        id="sst-rvp-sort"
        className="sst-collection-sort__select"
        name="rv_sort"
        defaultValue={sort}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {SORT_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="sst-button sst-button--ghost">
          정렬
        </button>
      </noscript>
    </form>
  );
}

/**
 * Opens a review photo full size when its thumbnail (.sst-review-media__thumb[data-full])
 * is clicked; closes on ×, Esc or a click on the dark backdrop.
 */
export function ReviewLightbox() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const thumb = (e.target as Element | null)?.closest?.<HTMLElement>(".sst-review-media__thumb[data-full]");
      if (thumb) setSrc(thumb.dataset.full ?? null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    // The source locks page scroll with this body class while a photo is open.
    document.body.classList.toggle("sst-review-lightbox-open", Boolean(src));
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSrc(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [src]);

  if (!src) return null;
  return createPortal(
    <div
      className="sst-review-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="닫기"
      onClick={(e) => e.target === e.currentTarget && setSrc(null)}
    >
      <button type="button" className="sst-review-lightbox__close" aria-label="닫기" onClick={() => setSrc(null)}>
        ×
      </button>
      <img src={src} alt="리뷰 사진" />
    </div>,
    document.body,
  );
}
