"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import data from "../data/quick-order.json";
import { SOURCE, src } from "../paths";
import { yen } from "../store";
import type { Product, ProductGroup } from "../types";
import { ProductRow } from "./ProductRow";

const GROUPS = (data as { groups: ProductGroup[] }).groups;

type SubTab = "all" | "box" | "psa10" | "bulk" | "other" | "vintage";

const SUB_TABS: { key: SubTab; label: string; group?: string }[] = [
  { key: "all", label: "전체" },
  { key: "box", label: "박스", group: "pokemon-box" },
  { key: "psa10", label: "PSA10", group: "pokemon-psa10" },
  { key: "bulk", label: "벌크", group: "pokemon-bulk" },
  { key: "other", label: "스페셜", group: "pokemon-other" },
  { key: "vintage", label: "빈티지", group: "pokemon-vintage" },
];

/** Family tabs other than Pokemon are outside this clone and open the live store. */
// `squeeze` is the horizontal scale the source applies to each tab label (same at every width).
const FAMILY_TABS: { label: string; tab: string; squeeze?: number; className?: string; href?: string }[] = [
  { label: "TOP", tab: "top", squeeze: 0.9, className: "sst-qo__tab--top" },
  { label: "쿠폰", tab: "coupon", squeeze: 0.737, className: "sst-qct-tab", href: `${SOURCE}/ko/my-account/customer-coupons` },
  { label: "Pokemon", tab: "pokemon" },
  { label: "원피스", tab: "onepiece", squeeze: 0.737 },
  { label: "Yu-Gi-Oh", tab: "yugioh" },
  { label: "Dragon Ball", tab: "dragonball", squeeze: 0.922 },
  { label: "손상 박스", tab: "discounted", squeeze: 0.856 },
  { label: "PSA10", tab: "psa10", squeeze: 0.944 },
];

/** Pulls the tab edge in by the width the scaleX removed, like the source's tab-width script. */
function useSqueezedTabs(container: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const fit = () => {
      root.querySelectorAll<HTMLElement>(".sst-tabw[data-squeeze]").forEach((el) => {
        const s = Number(el.dataset.squeeze);
        el.style.marginRight = `${-((1 - s) * el.offsetWidth).toFixed(1)}px`;
      });
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [container]);
}

const POPULAR = ["Pikachu", "Charizard", "Mewtwo", "Rayquaza", "Mew", "Umbreon", "Gengar", "Eevee", "Sylveon", "Dragonite", "Lucario", "Lugia", "Snorlax", "Blastoise", "Mimikyu", "Arceus", "Psyduck", "Charmander"];

const SORTS: [string, string][] = [
  ["default", "추천순"],
  ["name-asc", "이름 A-Z"],
  ["name-desc", "이름 Z-A"],
  ["price-asc", "가격 낮은순"],
  ["price-desc", "가격 높은순"],
  ["stock-desc", "재고 많은순"],
];

/** Upper bound of the "all" price slider as shown by the source. */
const ALL_PRICE_CEILING = 1160000;
const SLIDER_STEPS = 1000;

interface Filters {
  q: string;
  inStock: boolean;
  outStock: boolean;
  stockOnly: boolean;
  min: number;
  max: number;
  sort: string;
  chip: string | null;
  quick: string;
}

const EMPTY: Filters = { q: "", inStock: false, outStock: false, stockOnly: false, min: 0, max: SLIDER_STEPS, sort: "default", chip: null, quick: "all" };

/** Non-linear slider: most products are cheap, so the low range gets more travel. */
const toPrice = (step: number, ceiling: number) => Math.round((ceiling * (step / SLIDER_STEPS) ** 2) / 1000) * 1000;

const hasStock = (p: Product) => p.offers.some((o) => o.stockState === "in");

function matches(p: Product, f: Filters, ceiling: number): boolean {
  const q = f.q.trim().toLowerCase();
  if (q && !p.search.includes(q) && !p.name.toLowerCase().includes(q)) return false;
  if (f.chip && !p.search.includes(f.chip.toLowerCase())) return false;
  if ((f.stockOnly || (f.inStock && !f.outStock)) && !hasStock(p)) return false;
  if (f.outStock && !f.inStock && hasStock(p)) return false;
  const lo = toPrice(f.min, ceiling);
  if (p.priceYen < lo) return false;
  if (f.max < SLIDER_STEPS && p.priceYen > toPrice(f.max, ceiling)) return false;
  if (f.quick === "under-10000" && p.priceYen >= 10000) return false;
  if (f.quick === "10000-20000" && (p.priceYen < 10000 || p.priceYen > 20000)) return false;
  if (f.quick === "over-20000" && p.priceYen <= 20000) return false;
  return true;
}

function sortRows(rows: Product[], sort: string): Product[] {
  const out = [...rows];
  switch (sort) {
    case "name-asc":
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return out.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return out.sort((a, b) => a.priceYen - b.priceYen);
    case "price-desc":
      return out.sort((a, b) => b.priceYen - a.priceYen);
    case "stock-desc":
      return out.sort((a, b) => b.stockTotal - a.stockTotal);
    default:
      return out;
  }
}

function Toolbar({
  filters,
  setFilters,
  count,
  ceiling,
  view,
  setView,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  count: string;
  ceiling: number;
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
}) {
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const lo = toPrice(filters.min, ceiling);
  const hi = filters.max >= SLIDER_STEPS ? ceiling : toPrice(filters.max, ceiling);
  return (
    <div className="sst-qo__toolbar">
      <span className="sst-qo__count">{count}</span>
      <span className="sst-qo__count sst-box-pop-count" />
      <span className="sst-qo__count sst-box-stock-count" />
      <div className="sst-qo__filters">
        <label className="sst-qo__stock-toggle sst-psa-stock-core" aria-pressed={filters.stockOnly}>
          <input type="checkbox" className="sst-qo__stock-only" checked={filters.stockOnly} onChange={(e) => set({ stockOnly: e.target.checked })} />{" "}
          <span className="sst-qo__stock-toggle-text">재고 있는 상품만</span>
        </label>
        <div className="sst-qo__search-wrap">
          <input type="text" className="sst-qo__search" placeholder="상품명 또는 JAN 검색" value={filters.q} onChange={(e) => set({ q: e.target.value })} />
          <div className="sst-qo__suggest" />
        </div>
        <div className="sst-psa-stock" role="group">
          <label className="sst-psa-stock__opt">
            <input type="checkbox" checked={filters.inStock} onChange={(e) => set({ inStock: e.target.checked })} />
            <span>In stock</span>
          </label>
          <label className="sst-psa-stock__opt">
            <input type="checkbox" checked={filters.outStock} onChange={(e) => set({ outStock: e.target.checked })} />
            <span>Out of stock</span>
          </label>
        </div>
        <select className="sst-qo__quick-filter sst-qo__price-filter" value={filters.quick} onChange={(e) => set({ quick: e.target.value })}>
          <option value="all">가격: 전체</option>
          <option value="under-10000">JPY 1만 미만</option>
          <option value="10000-20000">JPY 1만-2만</option>
          <option value="over-20000">JPY 2만 이상</option>
        </select>
        <div className="sst-psa-price">
          <div className="sst-psa-price__head">
            <span className="sst-psa-price__label">Price</span>
            <span className="sst-psa-price__range">
              {yen(lo)} – {yen(hi)}
            </span>
          </div>
          <div className="sst-psa-price__track">
            <div
              className="sst-psa-price__fill"
              style={{ left: `${(filters.min / SLIDER_STEPS) * 100}%`, right: `${100 - (filters.max / SLIDER_STEPS) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={SLIDER_STEPS}
              value={filters.min}
              aria-label="Minimum price"
              onChange={(e) => set({ min: Math.min(Number(e.target.value), filters.max) })}
            />
            <input
              type="range"
              min={0}
              max={SLIDER_STEPS}
              value={filters.max}
              aria-label="Maximum price"
              onChange={(e) => set({ max: Math.max(Number(e.target.value), filters.min) })}
            />
          </div>
        </div>
        <select className="sst-qo__sort" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="sst-qo__view-seg" aria-label="보기">
          <button type="button" data-view="grid" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
            그리드
          </button>
          <button type="button" data-view="list" aria-pressed={view === "list"} onClick={() => setView("list")}>
            목록
          </button>
        </div>
      </div>
      <div className="sst-box-pop" role="group" aria-label="Popular Pokemon">
        <span className="sst-box-pop__label">Popular Pokemon</span>
        <div className="sst-box-pop__chips">
          {POPULAR.map((name) => (
            <button
              key={name}
              className="sst-box-pop__chip"
              type="button"
              aria-current={filters.chip === name ? "true" : undefined}
              onClick={() => set({ chip: filters.chip === name ? null : name })}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CouponTile() {
  // The source injects this <button> straight into the card grid (tbody).
  // A display:contents row keeps the table markup valid while the button stays the grid item.
  return (
    <tr className="sst-qcp-row">
      <td className="sst-qcp-row__cell">
        <a
          className="sst-qcp-tile"
          href={`${SOURCE}/ko/my-account?register=1`}
          aria-label="쿠폰 받기. 무료 가입하고 2,000포인트 받기."
        >
          <picture className="sst-qcp-tile__pic">
            <source className="sst-qcp-tile__src" media="(max-width: 749px)" srcSet={src("/mu-plugins/sst-qo-coupon-promo-tile/signup-2000pt-mobile.0a6a786bbde6.webp")} />
            <img className="sst-qcp-tile__img" src={src("/mu-plugins/sst-qo-coupon-promo-tile/signup-2000pt-desktop.28dce3e79f17.webp")} alt="" width={900} height={600} />
          </picture>
          <span className="sst-qcp-tile__cta">
            <span className="sst-qcp-tile__cta-text">쿠폰 받기</span>
          </span>
        </a>
      </td>
    </tr>
  );
}

const LEGACY_GROUP: Record<string, string> = { psa10: "psa10", bulk: "bulk", other: "other", vintage: "vintage" };

const PSA_NOTICE = "PSA 상품 이미지는 참고용입니다. 재고가 빠르게 업데이트되기 때문에 각 실제 상품의 개별 사진은 제공되지 않습니다.";

export function QuickOrder() {
  const [sub, setSub] = useState<SubTab>("all");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [view, setView] = useState<"grid" | "list">("grid");
  const familyTabsRef = useRef<HTMLDivElement>(null);
  useSqueezedTabs(familyTabsRef);

  const activeGroup = SUB_TABS.find((t) => t.key === sub)?.group;
  const visibleGroups = activeGroup ? GROUPS.filter((g) => g.id === activeGroup) : GROUPS;
  const ceiling = useMemo(() => {
    if (!activeGroup) return ALL_PRICE_CEILING;
    const g = GROUPS.find((x) => x.id === activeGroup);
    const top = Math.max(0, ...(g?.rows.map((r) => r.priceYen) ?? [0]));
    return Math.ceil(top / 10000) * 10000;
  }, [activeGroup]);

  const rendered = visibleGroups.map((g) => {
    const base = sub === "all"
      ? g.rows.filter((r) => !r.dupOfFeatured && !(g.id === "pokemon-psa10" && !hasStock(r)))
      : g.rows;
    const rows = sortRows(base.filter((r) => matches(r, filters, ceiling)), filters.sort);
    return { group: g, rows };
  });

  const shown = rendered.reduce((n, r) => n + r.rows.length, 0);
  const total = visibleGroups.reduce((n, g) => n + g.total, 0);
  const count = shown === total ? `${total}개 상품` : `${shown} / ${total}개 상품`;
  const filtered = JSON.stringify(filters) !== JSON.stringify(EMPTY);

  const switchSub = (key: SubTab) => {
    setSub(key);
    setFilters(EMPTY);
  };

  return (
    <section
      id="quick-order"
      className={`sst-qo sst-qo--pin-preorder${view === "list" ? " sst-qo--list" : ""}`}
      data-active-tab="pokemon"
      data-qo-mode="order"
      data-sst-qo-cart-context="normal"
    >
      <div className="sst-qo__inner">
        <div className="sst-qo__layout">
          <div className="sst-qo__main">
            <div className="sst-qo__tabs sst-qo__tabs--family" role="tablist" data-qo-family-tabs="" data-sst-fade="1" ref={familyTabsRef}>
              {FAMILY_TABS.map((t) => {
                const active = t.tab === "pokemon";
                return (
                  <button
                    key={t.tab}
                    type="button"
                    className={`sst-qo__tab sst-qo__tab--family${t.className ? ` ${t.className}` : ""}`}
                    {...(t.tab === "coupon"
                      ? { "data-sst-qct-tab": "1" }
                      : { "data-tab": t.tab, "data-qo-family-tab": t.tab })}
                    aria-pressed={active}
                    onClick={() => {
                      if (active) switchSub("all");
                      else window.location.href = t.href ?? `${SOURCE}/ko/?qo_tab=${t.tab}#quick-order`;
                    }}
                  >
                    {t.squeeze ? (
                      <span className="sst-tabw" data-squeeze={t.squeeze} style={{ transform: `scaleX(${t.squeeze})` }}>
                        {t.label}
                      </span>
                    ) : (
                      t.label
                    )}
                  </button>
                );
              })}
            </div>
            <div className="sst-qo__tabs sst-qo__tabs--subgroup" role="tablist" data-qo-subgroup-tabs="">
              {SUB_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className="sst-qo__tab sst-qo__tab--subgroup"
                  data-qo-family="pokemon"
                  data-qo-subgroup-tab={t.key}
                  aria-pressed={sub === t.key}
                  onClick={() => switchSub(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {rendered.map(({ group: g, rows }, gi) => {
              const isPsa = g.id === "pokemon-psa10";
              const showToolbar = gi === 0;
              // The PSA series side panel is not part of this clone, so its layout
              // classes are dropped in the PSA10 view to avoid reserving an empty column.
              const sidePanelClasses = new Set(["sst-psa-side-on", "sst-psa-search-side"]);
              const classes = [
                "sst-qo__group",
                ...(g.classes ?? "").split(" ").filter((c) => c && (sub === "all" || !sidePanelClasses.has(c))),
                "sst-psa-price-on",
                "sst-psa-stock-on",
                isPsa ? "" : "sst-box-tb",
                sub === "all" ? "sst-qo-in-all" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <div
                  key={g.id}
                  className={classes}
                  data-group={g.id}
                  data-qo-family="pokemon"
                  data-qo-subgroup={g.subgroup}
                  data-qo-legacy-group={LEGACY_GROUP[g.subgroup] ?? "pokemon"}
                  data-qo-preorder-group={g.subgroup === "preorder" ? 1 : undefined}
                >
                  <p className="sst-qo__label" hidden={sub !== "all"}>
                    {g.label}
                  </p>
                  {isPsa && sub === "all" && (
                    <p className="sst-qo__psa-notice" role="note">
                      {PSA_NOTICE}
                    </p>
                  )}
                  {showToolbar && (
                    <Toolbar filters={filters} setFilters={setFilters} count={count} ceiling={ceiling} view={view} setView={setView} />
                  )}
                  <div className="sst-qo__table-wrap">
                    <table className="sst-qo__table">
                      <thead>
                        <tr>
                          <th>상품</th>
                          <th>밀봉</th>
                          <th>슈링크 없음</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.id === "pokemon-preorder" && sub === "all" && view === "grid" && <CouponTile />}
                        {rows.map((p) => (
                          <ProductRow key={p.key} product={p} />
                        ))}
                      </tbody>
                    </table>
                    {rows.length === 0 && <div className="sst-qo__empty">검색 조건과 일치하는 상품이 없습니다.</div>}
                  </div>
                  <div className="sst-qo__filter-empty" hidden={!(filtered && rows.length === 0)}>
                    <span className="sst-qo__filter-empty-text" />
                    <button type="button" className="sst-qo__filter-empty-clear" onClick={() => setFilters(EMPTY)}>
                      Clear filters
                    </button>
                  </div>
                  {g.lazy && g.rows.length < g.total && (
                    <div className="sst-qo__lazy">
                      {isPsa
                        ? `${g.lazy} (${g.rows.length} / ${g.total} 표시).`
                        : `${g.lazy} (${g.rows.length} / ${g.total} shown).`}
                    </div>
                  )}
                  {isPsa && sub === "all" && (
                    <a
                      className="sst-all-psa-cap__more is-on"
                      href="#quick-order"
                      onClick={(e) => {
                        e.preventDefault();
                        switchSub("psa10");
                        document.getElementById("quick-order")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      See all PSA10 cards →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
