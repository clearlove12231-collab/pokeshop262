import "./samuraiswordtokyo.css";
import "./shop.css";
import type { ReactNode } from "react";
import { LinkGuard } from "./LinkGuard";
import { CartDrawer, OrderHelpChat } from "./Overlays";
import { SiteHeader } from "./SiteHeader";
import { RankBand, SiteFooter } from "./SiteSections";
import { StoreProvider } from "./store";

/** Header, footer and floating UI shared by every page. */
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
      {/*
        Empty slot of the base layout's merchant widget. Up to 1024px it sits in the page flow
        with 12px margins (see the end of samuraiswordtokyo.css).
      */}
      <div id="google-merchantwidget-iframe-wrapper" />
    </StoreProvider>
  );
}
