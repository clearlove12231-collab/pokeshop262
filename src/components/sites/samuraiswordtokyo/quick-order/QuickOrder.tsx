"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import data from "../data/quick-order.json";
import { formatPrice } from "../price";
import { applyShopRules } from "../shop";
import type { Product, ProductGroup } from "../types";
import { ProductRow } from "./ProductRow";

/** Source catalog with the owner's rules (sold-out groups) applied; see shop.ts. */
const GROUPS = applyShopRules((data as { groups: ProductGroup[] }).groups);

/**
 * Sub-tabs of the Pokemon tab. PSA10 (individual graded cards) is not sold on
 * this clone, and the other game tabs (TOP, coupons, One Piece, Yu-Gi-Oh,
 * Dragon Ball, damaged boxes, PSA10) are removed.
 */
type SubTab = "all" | "box" | "bulk" | "other" | "vintage";

const SUB_TABS: { key: SubTab; label: string; group?: string }[] = [
  { key: "all", label: "전체" },
  { key: "box", label: "박스", group: "pokemon-box" },
  { key: "bulk", label: "벌크", group: "pokemon-bulk" },
  { key: "other", label: "스페셜", group: "pokemon-other" },
  { key: "vintage", label: "빈티지", group: "pokemon-vintage" },
];

const LEGACY_GROUP: Record<string, string> = { bulk: "bulk", other: "other", vintage: "vintage" };

const POPULAR = ["Pikachu", "Charizard", "Mewtwo", "Rayquaza", "Mew", "Umbreon", "Gengar", "Eevee", "Sylveon", "Dragonite", "Lucario", "Lugia", "Snorlax", "Blastoise", "Mimikyu", "Arceus", "Psyduck", "Charmander"];

const SORTS: [string, string][] = [
  ["default", "추천순"],
  ["name-asc", "이름 A-Z"],
  ["name-desc", "이름 Z-A"],
  ["price-asc", "가격 낮은순"],
  ["price-desc", "가격 높은순"],
  ["stock-desc", "재고 많은순"],
];

/** Rows per page: the source loads 24 more each time the group's status line nears the viewport. */
const PAGE = 24;
const LAZY_ROOT_MARGIN = "480px 0px";

const SLIDER_STEPS = 1000;

interface Filters {
  q: string;
  inStock: boolean;
  outStock: boolean;
  min: number;
  max: number;
  sort: string;
  chip: string | null;
}

const EMPTY: Filters = { q: "", inStock: false, outStock: false, min: 0, max: SLIDER_STEPS, sort: "default", chip: null };

/** Non-linear slider: most products are cheap, so the low range gets more travel. Values in JPY. */
const toPrice = (step: number, ceiling: number) => Math.round((ceiling * (step / SLIDER_STEPS) ** 2) / 1000) * 1000;

const hasStock = (p: Product) => p.offers.some((o) => o.stockState === "in");

function matches(p: Product, f: Filters, ceiling: number): boolean {
  const q = f.q.trim().toLowerCase();
  if (q && !p.search.includes(q) && !p.name.toLowerCase().includes(q) && !(p.jan ?? "").includes(q)) return false;
  if (f.chip && !p.search.includes(f.chip.toLowerCase())) return false;
  if (f.inStock && !f.outStock && !hasStock(p)) return false;
  if (f.outStock && !f.inStock && hasStock(p)) return false;
  if (p.priceYen < toPrice(f.min, ceiling)) return false;
  if (f.max < SLIDER_STEPS && p.priceYen > toPrice(f.max, ceiling)) return false;
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

function Toolbar({ filters, setFilters, count, ceiling }: { filters: Filters; setFilters: (f: Filters) => void; count: string; ceiling: number }) {
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const lo = toPrice(filters.min, ceiling);
  const hi = filters.max >= SLIDER_STEPS ? ceiling : toPrice(filters.max, ceiling);
  return (
    <div className="sst-qo__toolbar">
      <span className="sst-qo__count">{count}</span>
      <div className="sst-qo__filters">
        <div className="sst-qo__search-wrap">
          <input type="text" className="sst-qo__search" placeholder="상품명 또는 JAN 검색" value={filters.q} onChange={(e) => set({ q: e.target.value })} />
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
        <div className="sst-psa-price">
          <div className="sst-psa-price__head">
            <span className="sst-psa-price__label">Price</span>
            <span className="sst-psa-price__range">
              {formatPrice(lo)} – {formatPrice(hi)}
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

/** Status line under a group; loads the next page when it comes within 480px of the viewport. */
function LazyStatus({ loaded, total, onMore }: { loaded: number; total: number; onMore: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMoreRef = useRef(onMore);
  const hasMore = loaded < total;
  useEffect(() => {
    onMoreRef.current = onMore;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore) return;
    // Re-observed after each page, so a status line still in range loads the next one too.
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && onMoreRef.current(), { rootMargin: LAZY_ROOT_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loaded]);
  return (
    <div className="sst-qo__lazy" data-lazy-status="" ref={ref}>
      {hasMore ? `Scroll to load more products (${loaded} / ${total} shown).` : ""}
    </div>
  );
}

export function QuickOrder() {
  const [sub, setSub] = useState<SubTab>("all");
  const [filters, setFiltersState] = useState<Filters>(EMPTY);
  const [limits, setLimits] = useState<Record<string, number>>({});

  const setFilters = (f: Filters) => {
    setFiltersState(f);
    setLimits({});
  };

  const activeGroup = SUB_TABS.find((t) => t.key === sub)?.group;
  const visibleGroups = useMemo(() => (activeGroup ? GROUPS.filter((g) => g.id === activeGroup) : GROUPS), [activeGroup]);
  // Slider ceiling (JPY): the highest price in view, rounded up to ¥10,000 like the source.
  const ceiling = useMemo(() => {
    const top = Math.max(0, ...visibleGroups.flatMap((g) => g.rows.map((r) => r.priceYen)));
    return Math.ceil(top / 10000) * 10000;
  }, [visibleGroups]);

  const rendered = visibleGroups.map((g) => {
    const list = sortRows(g.rows.filter((r) => matches(r, filters, ceiling)), filters.sort);
    const limit = limits[g.id] ?? PAGE;
    const loaded = Math.min(limit, list.length);
    // "전체" hides rows that already appear in Preorder/HOT.
    const rows = list.slice(0, loaded).filter((r) => sub !== "all" || !r.dupOfFeatured);
    const total = sub === "all" ? list.filter((r) => !r.dupOfFeatured).length : list.length;
    return { group: g, rows, loaded, listLength: list.length, total };
  });

  const shown = rendered.reduce((n, r) => n + r.rows.length, 0);
  const total = rendered.reduce((n, r) => n + r.total, 0);
  const count = shown === total ? `${total}개 상품` : `${shown} / ${total}개 상품`;
  const filtered = JSON.stringify(filters) !== JSON.stringify(EMPTY);

  const switchSub = (key: SubTab) => {
    setSub(key);
    setFilters(EMPTY);
  };

  return (
    <section id="quick-order" className="sst-qo sst-qo--pin-preorder" data-active-tab="pokemon" data-qo-mode="order" data-sst-qo-cart-context="normal">
      <div className="sst-qo__inner">
        <div className="sst-qo__layout">
          <div className="sst-qo__main">
            <div className="sst-qo__tabs sst-qo__tabs--family" role="tablist" data-qo-family-tabs="" data-sst-fade="1">
              <button
                type="button"
                className="sst-qo__tab sst-qo__tab--family"
                data-tab="pokemon"
                data-qo-family-tab="pokemon"
                aria-pressed="true"
                onClick={() => switchSub("all")}
              >
                Pokemon
              </button>
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

            {rendered.map(({ group: g, rows, loaded, listLength }, gi) => {
              const classes = ["sst-qo__group", ...(g.classes ?? "").split(" ").filter(Boolean), "sst-psa-price-on", "sst-psa-stock-on", "sst-box-tb", sub === "all" ? "sst-qo-in-all" : ""]
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
                  {gi === 0 && <Toolbar filters={filters} setFilters={setFilters} count={count} ceiling={ceiling} />}
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
                  {g.id !== "pokemon-preorder" && (
                    <LazyStatus
                      loaded={loaded}
                      total={listLength}
                      onMore={() => setLimits((prev) => ({ ...prev, [g.id]: (prev[g.id] ?? PAGE) + PAGE }))}
                    />
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
