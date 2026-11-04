export type OfferAction = "quantity" | "unavailable" | "quote";

export interface Offer {
  type: "sealed" | "noshrink" | "carton";
  /** Source modifier classes, e.g. sst-qo__offer--sealed, sst-qo__offer--single */
  classes: string[];
  colSpan?: number;
  label: string;
  stockText: string;
  stockState: "in" | "out";
  action: OfferAction;
  priceYen: number;
  price: string | null;
  saleRegular?: string;
  saleCurrent?: string;
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
  img: ProductImage;
  jan?: string;
  priceYen: number;
  stockTotal: number;
  hot: boolean;
  sale: boolean;
  flash: boolean;
  preorder: boolean;
  releaseText?: string;
  rarity?: string;
  pinned?: boolean;
  dupOfFeatured?: boolean;
  offers: Offer[];
}

export interface ProductGroup {
  id: string;
  subgroup: string;
  label: string;
  classes?: string;
  total: number;
  lazy?: string;
  rows: Product[];
}

export interface CartLine {
  variantId: number;
  handle: string;
  name: string;
  img: string;
  /** Source price (JPY). */
  priceYen: number;
  /** Unit price shown on the card (KRW); older saved carts may not have it. */
  priceWon?: number;
  max: number;
  qty: number;
}
