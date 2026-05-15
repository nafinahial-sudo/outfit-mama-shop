import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Trash2, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCart();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl">Your Cart</h1>
        {items.length === 0 ? (
          <div className="mt-10 rounded-sm border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/" className="mt-4 inline-block text-gold">Continue shopping →</Link>
          </div>
        ) : (
          <>
            <div className="mt-6 divide-y divide-border border-y border-border">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-4">
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[item.size, item.color].filter(Boolean).join(" · ") || ""}
                        </p>
                      </div>
                      <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center rounded-sm border border-border">
                        <button onClick={() => updateQty(idx, item.quantity - 1)} className="px-2 py-1.5"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-xs">{item.quantity}</span>
                        <button onClick={() => updateQty(idx, item.quantity + 1)} className="px-2 py-1.5"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="text-sm text-gold">৳{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col items-end gap-4">
              <div className="text-sm">Subtotal: <span className="text-gold text-base">৳{subtotal.toLocaleString()}</span></div>
              <Link
                to="/checkout"
                className="rounded-sm bg-gold px-8 py-3 text-sm font-semibold text-background hover:opacity-90"
              >
                Checkout →
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
