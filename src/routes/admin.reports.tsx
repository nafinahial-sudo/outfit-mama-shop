import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/admin/reports")({ component: () => <AdminShell><Reports /></AdminShell> });

function Reports() {
  const { data } = useQuery({
    queryKey: ["admin", "report"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const orders = data ?? [];
  const delivered = orders.filter((o) => o.status === "delivered");
  const revenue = delivered.reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const shipped = orders.filter((o) => o.status === "shipped").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const aov = delivered.length ? revenue / delivered.length : 0;

  // Last 7 days
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const total = delivered
      .filter((o) => o.created_at.slice(0, 10) === key)
      .reduce((s, o) => s + Number(o.total), 0);
    return { key, label: d.toLocaleDateString(undefined, { weekday: "short" }), total };
  });
  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Insights</div>
      <h1 className="mt-1 font-display text-3xl">Sales Report</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Revenue" value={`৳${revenue.toLocaleString()}`} />
        <Stat label="Delivered Orders" value={delivered.length} />
        <Stat label="Avg. Order Value" value={`৳${Math.round(aov).toLocaleString()}`} />
        <Stat label="Total Orders" value={orders.length} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Pending" value={pending} />
        <Stat label="Shipped" value={shipped} />
        <Stat label="Cancelled" value={cancelled} />
      </div>

      <div className="mt-10 rounded-sm border border-border p-6">
        <h2 className="font-display text-xl">Last 7 days · Delivered Revenue</h2>
        <div className="mt-6 flex h-48 items-end gap-3">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="text-xs text-gold">৳{d.total.toLocaleString()}</div>
              <div className="w-full rounded-t-sm bg-gold transition-all" style={{ height: `${(d.total / max) * 100}%`, minHeight: "4px" }} />
              <div className="text-xs text-muted-foreground">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-border p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl">{value}</div>
    </div>
  );
}
