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

const CART_KEY = "sst-clone-cart-v2";

interface StoreValue {
  cart: CartLine[];
  cartCount: number;
  /** Sum of the displayed (rounded) unit prices × quantities, in won. */
  cartTotal: number;
  qtyFor: (variantId: number) => number;
  setQty: (line: Omit<CartLine, "qty">, qty: number) => void;
  removeLine: (variantId: number) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartLine[]).filter((l) => typeof l.priceWon === "number") : [];
  } catch {
    return [];
  }
}

function writeCart(cart: CartLine[]) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Storage unavailable (private mode); the cart stays in memory.
  }
}

/** Local-only cart. Nothing is sent to the source store. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Hydrate the persisted cart after mount so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(readCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeCart(cart);
  }, [cart, loaded]);

  useEffect(() => {
    document.body.classList.toggle("sst-cart-open", cartOpen);
  }, [cartOpen]);

  const setQty = useCallback((line: Omit<CartLine, "qty">, qty: number) => {
    const next = Math.max(0, Math.min(line.max || 0, Math.floor(qty) || 0));
    setCart((prev) => {
      if (next === 0) return prev.filter((l) => l.variantId !== line.variantId);
      const updated = { ...line, qty: next };
      return prev.some((l) => l.variantId === line.variantId)
        ? prev.map((l) => (l.variantId === line.variantId ? updated : l))
        : [...prev, updated];
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      cartTotal: cart.reduce((n, l) => n + l.qty * l.priceWon, 0),
      qtyFor: (variantId) => cart.find((l) => l.variantId === variantId)?.qty ?? 0,
      setQty,
      removeLine: (variantId) => setCart((prev) => prev.filter((l) => l.variantId !== variantId)),
      cartOpen,
      setCartOpen,
    }),
    [cart, cartOpen, setQty],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
