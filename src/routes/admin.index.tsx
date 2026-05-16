import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, DollarSign, Store } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  return (
    <AdminShell>
      <Inner />
    </AdminShell>
  );
}

function Inner() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [{ count: products }, { data: orders }, { data: offline }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("id,total,status,created_at"),
        supabase.from("offline_sales").select("id,total,sold_at"),
      ]);
      const all = orders ?? [];
      const onlineRevenue = all
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + Number(o.total), 0);
      const offlineRevenue = (offline ?? []).reduce((s, r) => s + Number(r.total), 0);
      const pending = all.filter((o) => o.status === "pending").length;
      return {
        products: products ?? 0,
        orders: all.length,
        offlineCount: (offline ?? []).length,
        onlineRevenue,
        offlineRevenue,
        totalRevenue: onlineRevenue + offlineRevenue,
        pending,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Dashboard</div>
      <h1 className="mt-1 font-display text-3xl">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Package className="h-4 w-4" />} label="Products" value={data?.products ?? "—"} />
        <Stat icon={<ShoppingBag className="h-4 w-4" />} label="Online Orders" value={data?.orders ?? "—"} />
        <Stat icon={<Store className="h-4 w-4" />} label="Offline Sales" value={data?.offlineCount ?? "—"} />
        <Stat icon={<DollarSign className="h-4 w-4" />} label="Total Revenue" value={`৳${(data?.totalRevenue ?? 0).toLocaleString()}`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Online Revenue (Delivered)" value={`৳${(data?.onlineRevenue ?? 0).toLocaleString()}`} />
        <Stat label="Offline Revenue" value={`৳${(data?.offlineRevenue ?? 0).toLocaleString()}`} />
        <Stat label="Pending Orders" value={data?.pending ?? "—"} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl">Recent Orders</h2>
        <div className="mt-3 overflow-hidden rounded-sm border border-border">
          {!recent?.length ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No orders yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="p-3">{o.customer_name}</td>
                    <td className="p-3">{o.phone}</td>
                    <td className="p-3 text-gold">৳{Number(o.total).toLocaleString()}</td>
                    <td className="p-3 capitalize">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-sm border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && <span className="text-gold">{icon}</span>}
      </div>
      <div className="mt-3 font-display text-2xl">{value}</div>
    </div>
  );
}
