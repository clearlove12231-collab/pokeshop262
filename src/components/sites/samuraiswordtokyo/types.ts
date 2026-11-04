/** Shapes of data/quick-order.json (built by scripts/samuraiswordtokyo/extract-catalog.mjs). */

export type OfferAction = "quantity" | "unavailable" | "quote";

/** What the offer's action area shows: quantity stepper, "not sold" note, or nothing. */
export type OfferActionKind = "qty" | "not-sold" | "notify" | "empty";

export interface Offer {
  type: "sealed" | "noshrink" | "carton";
  /** Source modifier classes, e.g. sst-qo__offer--sealed, sst-qo__offer--single */
  classes: string[];
  colSpan?: number;
  label: string;
  stockText: string;
  stockState: "in" | "out";
  action: OfferAction;
  actionKind: OfferActionKind;
  /** "priced" shows a price; "ask" / "missing" show none. */
  priceState: "priced" | "ask" | "missing";
  /** Source price in JPY (the sale price when the offer is on sale). */
  priceYen: number;
  saleRegularYen?: number;
  salePriceYen?: number;
  max: number;
  variantId: number;
  sku?: string;
  cartName?: string;
}

export interface ProductImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  width: number;
  height: number;
  variant: string;
  alt: string;
}

export interface Product {
  key: string;
  handle: string;
  rowClass?: string;
  group: string;
  subgroup: string;
  name: string;
  search: string;
  jan?: string;
  img: ProductImage;
  priceYen: number;
  stockTotal: number;
  hot: boolean;
  sale: boolean;
  flash: boolean;
  preorder: boolean;
  releaseText?: string;
  /** Also listed in Preorder/HOT, so the "전체" view hides this copy. */
  dupOfFeatured?: boolean;
  rating?: { avg: number; count: number };
  offers: Offer[];
}

export interface ProductGroup {
  id: string;
  subgroup: string;
  label: string;
  classes?: string;
  total: number;
  rows: Product[];
}

export interface CartLine {
  variantId: number;
  handle: string;
  name: string;
  img: string;
  /** Unit price as shown on the card, already converted and rounded (KRW). */
  priceWon: number;
  max: number;
  qty: number;
}
