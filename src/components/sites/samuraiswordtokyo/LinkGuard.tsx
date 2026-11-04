"use client";

import { useEffect } from "react";
import { LINK_TO_SOURCE, isSourceUrl } from "./paths";

/**
 * Keeps visitors on the clone: cancels clicks on blocked links (href="#",
 * produced by sourceHref) and on any link that still points at the live store.
 * Covers normal, middle and modifier clicks; does nothing when LINK_TO_SOURCE is on.
 */
export function LinkGuard() {
  useEffect(() => {
    if (LINK_TO_SOURCE) return;
    const block = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.getAttribute("href") === "#" || isSourceUrl(new URL(anchor.href))) {
        e.preventDefault();
      }
    };
    document.addEventListener("click", block, true);
    document.addEventListener("auxclick", block, true);
    return () => {
      document.removeEventListener("click", block, true);
      document.removeEventListener("auxclick", block, true);
    };
  }, []);
  return null;
}
