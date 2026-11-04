import "./samuraiswordtokyo.css";
import { HomeSlider } from "./HomeSlider";
import { LinkGuard } from "./LinkGuard";
import { CartDrawer, OrderHelpChat, PromoPop } from "./Overlays";
import { QuickOrder } from "./quick-order/QuickOrder";
import { SiteHeader } from "./SiteHeader";
import { RankBand, ReviewBar, SiteFooter } from "./SiteSections";
import { StoreProvider } from "./store";

/** Samurai Sword Tokyo homepage (ko locale, Pokemon quick-order tab). */
export function SamuraiSwordHome() {
  return (
    <StoreProvider>
      <LinkGuard />
      <RankBand />
      <SiteHeader />
      <HomeSlider />
      <ReviewBar />
      <QuickOrder />
      <SiteFooter />
      <CartDrawer />
      <OrderHelpChat />
      <PromoPop />
    </StoreProvider>
  );
}
