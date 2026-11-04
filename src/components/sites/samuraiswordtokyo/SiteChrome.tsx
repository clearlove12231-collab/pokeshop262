import "./samuraiswordtokyo.css";
import type { ReactNode } from "react";
import { LinkGuard } from "./LinkGuard";
import { CartDrawer, OrderHelpChat, PromoPop } from "./Overlays";
import { SiteHeader } from "./SiteHeader";
import { RankBand, SiteFooter } from "./SiteSections";
import { StoreProvider } from "./store";

/** Header, footer and floating UI shared by every cloned page, in source DOM order. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <LinkGuard />
      <RankBand />
      <SiteHeader />
      {children}
      <SiteFooter />
      <CartDrawer />
      <OrderHelpChat />
      <PromoPop />
      {/*
        Empty slot of Google's merchant widget on the source (the badge itself is not cloned).
        Up to 1024px it sits in the page flow with 12px margins, adding 24px above the footer;
        see the clone-specific rules at the end of samuraiswordtokyo.css.
      */}
      <div id="google-merchantwidget-iframe-wrapper" />
    </StoreProvider>
  );
}
