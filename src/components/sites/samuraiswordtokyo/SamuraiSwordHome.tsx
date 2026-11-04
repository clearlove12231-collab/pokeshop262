import { QuickOrder } from "./quick-order/QuickOrder";
import { ShopHero } from "./ShopHero";
import { SiteChrome } from "./SiteChrome";

/** Shop homepage: hero + Pokemon quick-order catalog. */
export function SamuraiSwordHome() {
  return (
    <SiteChrome>
      <ShopHero />
      <QuickOrder />
    </SiteChrome>
  );
}
