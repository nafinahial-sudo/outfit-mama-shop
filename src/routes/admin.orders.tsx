import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/orders")({ component: () => <AdminShell><Orders /></AdminShell> });

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function Orders() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const { data, refetch } = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data as Order[];
    },
  });

  const setStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    refetch();
  };

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Orders</div>
      <h1 className="mt-1 font-display text-3xl">Manage Orders</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-sm border px-3 py-1.5 text-xs uppercase tracking-wider ${filter === s ? "border-gold bg-gold text-background" : "border-border"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {!data?.length ? (
          <div className="rounded-sm border border-border p-12 text-center text-sm text-muted-foreground">No orders</div>
        ) : (
          data.map((o) => <OrderCard key={o.id} order={o} onStatus={setStatus} />)
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onStatus }: { order: Order; onStatus: (id: string, s: OrderStatus) => void }) {
  const [open, setOpen] = useState(false);
  const { data: items } = useQuery({
    queryKey: ["order-items", order.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", order.id);
      if (error) throw error;
      return data as OrderItem[];
    },
  });

  return (
    <div className="rounded-sm border border-border">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left">
        <div>
          <div className="text-sm font-medium">{order.customer_name}</div>
          <div className="text-xs text-muted-foreground">{order.phone} · {order.district}</div>
        </div>
        <div className="text-sm text-gold">৳{Number(order.total).toLocaleString()}</div>
        <div className="text-xs uppercase tracking-wider rounded-sm bg-muted px-2 py-1">{order.status}</div>
        <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
      </button>
      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="text-muted-foreground">Address:</span> {order.address}</div>
            <div><span className="text-muted-foreground">Payment:</span> {order.payment_method === "cod" ? "Cash on Delivery" : "Online"}</div>
          </div>
          {order.notes && <div className="text-sm"><span className="text-muted-foreground">Notes:</span> {order.notes}</div>}
          <div>
            <h4 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Items</h4>
            <div className="space-y-2">
              {items?.map((it) => (
                <div key={it.id} className="flex items-center gap-3 text-sm">
                  <div className="h-12 w-10 overflow-hidden rounded-sm bg-muted">
                    {it.product_image && <img src={it.product_image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div>{it.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[it.size, it.color, `× ${it.quantity}`].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="text-gold">৳{(Number(it.unit_price) * it.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => onStatus(order.id, s)}
                disabled={order.status === s}
                className="rounded-sm border border-border px-3 py-1.5 text-xs uppercase tracking-wider hover:border-gold disabled:opacity-40">
                {s === "confirmed" ? "Confirm" : s === "shipped" ? "Ship" : s === "delivered" ? "Deliver" : s === "cancelled" ? "Cancel" : "Pending"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
