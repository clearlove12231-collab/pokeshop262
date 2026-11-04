import { HomeSlider } from "./HomeSlider";
import { QuickOrder } from "./quick-order/QuickOrder";
import { SiteChrome } from "./SiteChrome";
import { ReviewBar } from "./SiteSections";

/** Samurai Sword Tokyo homepage (ko locale, Pokemon quick-order tab). */
export function SamuraiSwordHome() {
  return (
    <SiteChrome>
      <HomeSlider />
      <ReviewBar />
      <QuickOrder />
    </SiteChrome>
  );
}
