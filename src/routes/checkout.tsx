import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useServerFn } from "@tanstack/react-start";
import { placeOrder } from "@/lib/order.functions";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/checkout")({ component: Checkout });

const SHIPPING = 100;

const schema = z.object({
  customer_name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  address: z.string().trim().min(5, "Address is required").max(500),
  district: z.string().trim().min(2, "District is required").max(100),
  payment_method: z.enum(["cod", "online"]),
  notes: z.string().max(500).optional(),
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    district: "",
    payment_method: "cod" as "cod" | "online",
    notes: "",
  });

  const total = subtotal + (items.length ? SHIPPING : 0);
  const placeOrderFn = useServerFn(placeOrder);

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return toast.error("Your cart is empty");
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Check your details");

    setSubmitting(true);
    try {
      const result = await placeOrderFn({
        data: {
          ...parsed.data,
          subtotal,
          shipping: SHIPPING,
          total,
          items,
        },
      });

      if (!result?.orderId) throw new Error("Failed to place order");

      clear();
      navigate({ to: "/order-success/$orderId", params: { orderId: result.orderId } });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="mx-auto max-w-md flex-1 p-12 text-center">
          <p className="font-display text-2xl">Your cart is empty</p>
          <Link to="/" className="mt-4 inline-block text-gold">Continue shopping →</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in your delivery details to place the order.</p>

        <form onSubmit={submitOrder} className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Field label="Full Name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} placeholder="e.g. Sadman Nahial" />
            <Field label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="01XXXXXXXXX" />
            <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="House, road, area" textarea />
            <Field label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} placeholder="e.g. Dhaka" />

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {(["cod", "online"] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setForm({ ...form, payment_method: m })}
                    className={`rounded-sm border p-4 text-left text-sm transition-colors ${form.payment_method === m ? "border-gold" : "border-border"}`}
                  >
                    <div className="font-medium">{m === "cod" ? "Cash on Delivery" : "Online Payment"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {m === "cod" ? "Pay when you receive the order" : "Pay via mobile banking / card"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Anything we should know?" textarea />
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-sm border border-border p-5">
            <h3 className="font-display text-lg">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((it, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                    {it.image && <img src={it.image} className="h-full w-full object-cover" alt="" />}
                  </div>
                  <div className="flex-1">
                    <div className="line-clamp-1">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[it.size, it.color, `× ${it.quantity}`].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="text-gold text-sm">৳{(it.price * it.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={`৳${subtotal.toLocaleString()}`} />
              <Row label="Shipping" value={`৳${SHIPPING}`} />
              <Row label="Total" value={`৳${total.toLocaleString()}`} bold />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-sm bg-gold py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Placing order…" : "Place Order"}
            </button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean; }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base text-foreground" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={bold ? "text-gold" : ""}>{value}</span>
    </div>
  );
}
