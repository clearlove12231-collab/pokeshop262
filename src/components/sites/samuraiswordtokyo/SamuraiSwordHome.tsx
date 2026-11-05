import "./samuraiswordtokyo.css";
import { FAMILIES, type Family } from "./families";
import { FamilyProvider } from "./family-context";
import { QuickOrder } from "./quick-order/QuickOrder";
import { ReviewBar, type ReviewBarData } from "./ReviewBar";
import { CATEGORY_OF_FAMILY, REVIEW_CATEGORIES } from "./reviews/constants";
import { STATS } from "./reviews/query";
import { SiteChrome } from "./SiteChrome";

/** Review bar numbers per game tab, counted on the server so the review data stays out of the client bundle. */
const REVIEW_BARS = Object.fromEntries(
  FAMILIES.map((f) => {
    const category = CATEGORY_OF_FAMILY[f];
    const { avg, avgText, total, photos, fiveStarShare, recentPhotos } = STATS[category];
    return [f, { href: REVIEW_CATEGORIES[category].path, avg, avgText, total, photos, fiveStarShare, recentPhotos }];
  }),
) as Record<Family, ReviewBarData>;

/**
 * Samurai Sword Tokyo homepage (ko locale), reduced to the Pokemon and One Piece
 * quick-order tabs plus the essentials around them: header with cart, review bar,
 * cart drawer. The rank band, campaign slider, other game tabs, sets section,
 * footer, gacha promo and order-help chat are removed.
 */
export function SamuraiSwordHome({ family }: { family: Family }) {
  return (
    <SiteChrome>
      <FamilyProvider initial={family}>
        <ReviewBar bars={REVIEW_BARS} />
        <QuickOrder />
      </FamilyProvider>
    </SiteChrome>
  );
}
