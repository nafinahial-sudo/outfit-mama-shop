import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "outfit-mama-cart";

type Ctx = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (idx: number) => void;
  updateQty: (idx: number, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (p) => p.productId === item.productId && p.size === item.size && p.color === item.color,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
  };
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateQty = (idx: number, qty: number) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, qty) } : it)));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
