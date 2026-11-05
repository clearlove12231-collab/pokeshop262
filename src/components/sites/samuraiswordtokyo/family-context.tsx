"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type Family } from "./families";

const FamilyContext = createContext<{ family: Family; setFamily: (f: Family) => void } | null>(null);

/**
 * The game tab chosen on the home page (?qo_tab=pokemon|onepiece, like the
 * source). Shared by the review bar and the quick order; switching keeps the
 * URL in sync without a reload.
 */
export function FamilyProvider({ initial, children }: { initial: Family; children: ReactNode }) {
  const [family, setFamilyState] = useState(initial);
  const setFamily = (f: Family) => {
    setFamilyState(f);
    const url = new URL(window.location.href);
    url.searchParams.set("qo_tab", f);
    window.history.replaceState(window.history.state, "", url);
  };
  return <FamilyContext.Provider value={{ family, setFamily }}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used inside FamilyProvider");
  return ctx;
}
