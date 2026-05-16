import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/admin/reports")({ component: () => <AdminShell><Reports /></AdminShell> });

type OfflineSale = { id: string; total: number; sold_at: string };

function Reports() {
  const { data: orders } = useQuery({
    queryKey: ["admin", "report"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });
  const { data: offline } = useQuery({
    queryKey: ["admin", "report-offline"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offline_sales").select("id,total,sold_at").order("sold_at", { ascending: false });
      if (error) throw error;
      return data as OfflineSale[];
    },
  });

  const ords = orders ?? [];
  const off = offline ?? [];
  const delivered = ords.filter((o) => o.status === "delivered");
  const onlineRevenue = delivered.reduce((s, o) => s + Number(o.total), 0);
  const offlineRevenue = off.reduce((s, r) => s + Number(r.total), 0);
  const totalRevenue = onlineRevenue + offlineRevenue;
  const pending = ords.filter((o) => o.status === "pending").length;
  const shipped = ords.filter((o) => o.status === "shipped").length;
  const cancelled = ords.filter((o) => o.status === "cancelled").length;
  const aov = delivered.length ? onlineRevenue / delivered.length : 0;

  // Last 7 days — stacked online + offline
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const onlineTotal = delivered.filter((o) => o.created_at.slice(0, 10) === key).reduce((s, o) => s + Number(o.total), 0);
    const offlineTotal = off.filter((r) => r.sold_at.slice(0, 10) === key).reduce((s, r) => s + Number(r.total), 0);
    return { key, label: d.toLocaleDateString(undefined, { weekday: "short" }), onlineTotal, offlineTotal, total: onlineTotal + offlineTotal };
  });
  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Insights</div>
      <h1 className="mt-1 font-display text-3xl">Sales Report</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Revenue" value={`৳${totalRevenue.toLocaleString()}`} highlight />
        <Stat label="Online Revenue" value={`৳${onlineRevenue.toLocaleString()}`} />
        <Stat label="Offline Revenue" value={`৳${offlineRevenue.toLocaleString()}`} />
        <Stat label="Avg. Online Order" value={`৳${Math.round(aov).toLocaleString()}`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Online Orders" value={ords.length} />
        <Stat label="Delivered" value={delivered.length} />
        <Stat label="Offline Sales" value={off.length} />
        <Stat label="Pending" value={pending} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Stat label="Shipped" value={shipped} />
        <Stat label="Cancelled" value={cancelled} />
      </div>

      <div className="mt-10 rounded-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Last 7 days · Revenue</h2>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-gold" /> Online</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-foreground/60" /> Offline</span>
          </div>
        </div>
        <div className="mt-6 flex h-56 items-end gap-3">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="text-xs text-gold">৳{d.total.toLocaleString()}</div>
              <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-sm" style={{ height: `${(d.total / max) * 100}%`, minHeight: "4px" }}>
                <div className="bg-gold" style={{ height: `${(d.onlineTotal / Math.max(d.total, 1)) * 100}%` }} />
                <div className="bg-foreground/60" style={{ height: `${(d.offlineTotal / Math.max(d.total, 1)) * 100}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-sm border p-5 ${highlight ? "border-gold" : "border-border"}`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-2xl ${highlight ? "text-gold" : ""}`}>{value}</div>
    </div>
  );
}
