import type { ReactNode } from "react";
import { CartDrawer } from "./CartDrawer";
import { SiteHeader } from "./SiteHeader";
import { StoreProvider } from "./store";

/**
 * Header and cart shared by every cloned page. Each page imports its own
 * stylesheet (home: samuraiswordtokyo.css, reviews: reviews/reviews.css).
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <SiteHeader />
      {children}
      <CartDrawer />
    </StoreProvider>
  );
}
