import "./samuraiswordtokyo.css";
import { QuickOrder } from "./quick-order/QuickOrder";
import { ReviewBar } from "./ReviewBar";
import { SiteChrome } from "./SiteChrome";

/**
 * Samurai Sword Tokyo homepage (ko locale), reduced to the Pokemon quick-order
 * tab plus the essentials around it: header with cart, review bar, cart drawer.
 * The rank band, campaign slider, other game tabs, sets section, footer, gacha
 * promo and order-help chat are removed.
 */
export function SamuraiSwordHome() {
  return (
    <SiteChrome>
      <ReviewBar />
      <QuickOrder />
    </SiteChrome>
  );
}
