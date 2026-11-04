"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "./types";

const CART_KEY = "sst-clone-cart";
const FAV_KEY = "sst-clone-favorites";

interface StoreValue {
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  qtyFor: (variantId: number) => number;
  setQty: (line: Omit<CartLine, "qty">, qty: number) => void;
  removeLine: (variantId: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  favorites: string[];
  toggleFavorite: (handle: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode); state stays in memory.
  }
}

/** Local-only cart + watchlist. Nothing is sent to the source store. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Hydrate persisted state after mount so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(readJson<CartLine[]>(CART_KEY, []));
    setFavorites(readJson<string[]>(FAV_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeJson(CART_KEY, cart);
  }, [cart, loaded]);

  useEffect(() => {
    if (loaded) writeJson(FAV_KEY, favorites);
  }, [favorites, loaded]);

  useEffect(() => {
    document.body.classList.toggle("sst-cart-open", cartOpen);
  }, [cartOpen]);

  const setQty = useCallback((line: Omit<CartLine, "qty">, qty: number) => {
    const next = Math.max(0, Math.min(line.max || 0, Math.floor(qty) || 0));
    setCart((prev) => {
      const rest = prev.filter((l) => l.variantId !== line.variantId);
      if (next === 0) return rest;
      const existing = prev.find((l) => l.variantId === line.variantId);
      const updated = { ...line, qty: next };
      return existing
        ? prev.map((l) => (l.variantId === line.variantId ? updated : l))
        : [...rest, updated];
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      cartTotal: cart.reduce((n, l) => n + l.qty * l.priceYen, 0),
      qtyFor: (variantId) => cart.find((l) => l.variantId === variantId)?.qty ?? 0,
      setQty,
      removeLine: (variantId) => setCart((prev) => prev.filter((l) => l.variantId !== variantId)),
      clearCart: () => setCart([]),
      cartOpen,
      setCartOpen,
      favorites,
      toggleFavorite: (handle) =>
        setFavorites((prev) =>
          prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle],
        ),
    }),
    [cart, cartOpen, favorites, setQty],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export const yen = (n: number) => `¥${n.toLocaleString("en-US")}`;
