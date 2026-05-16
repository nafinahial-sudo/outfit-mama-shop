import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { CATEGORY_OPTIONS } from "@/lib/constants";

export const Route = createFileRoute("/admin/offline-sales")({
  component: () => <AdminShell><OfflineSales /></AdminShell>,
});

function OfflineSales() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    product_name: "", category: "", size: "", color: "",
    quantity: "1", unit_price: "", customer_name: "", phone: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: sales } = useQuery({
    queryKey: ["offline-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offline_sales")
        .select("*")
        .order("sold_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_name.trim()) return toast.error("Product name required");
    const qty = +form.quantity || 1;
    const price = +form.unit_price;
    if (!price || isNaN(price)) return toast.error("Valid unit price required");
    setSaving(true);
    try {
      const { error } = await supabase.from("offline_sales").insert({
        product_name: form.product_name.trim(),
        category: form.category || null,
        size: form.size.trim() || null,
        color: form.color.trim() || null,
        quantity: qty,
        unit_price: price,
        total: qty * price,
        customer_name: form.customer_name.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
      toast.success("Offline sale recorded");
      setForm({ product_name: "", category: "", size: "", color: "", quantity: "1", unit_price: "", customer_name: "", phone: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["offline-sales"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["admin", "report"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this sale?")) return;
    const { error } = await supabase.from("offline_sales").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["offline-sales"] });
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["admin", "report"] });
  };

  const total = (sales ?? []).reduce((s, r) => s + Number(r.total), 0);

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">In-store</div>
      <h1 className="mt-1 font-display text-3xl">Offline Sales</h1>

      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-sm border border-border p-5 sm:grid-cols-2">
        <Field label="Product Name" value={form.product_name} onChange={(v) => setForm({ ...form, product_name: v })} />
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none">
            <option value="">— None —</option>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Size" value={form.size} onChange={(v) => setForm({ ...form, size: v })} />
        <Field label="Color" value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
        <Field label="Quantity" type="number" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
        <Field label="Unit Price (৳)" type="number" value={form.unit_price} onChange={(v) => setForm({ ...form, unit_price: v })} />
        <Field label="Customer Name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <div className="sm:col-span-2">
          <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
        </div>
        <div className="sm:col-span-2">
          <button disabled={saving} className="rounded-sm bg-gold px-8 py-3 text-sm font-semibold text-background disabled:opacity-60">
            {saving ? "Saving…" : "Record Sale"}
          </button>
        </div>
      </form>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl">All Offline Sales</h2>
        <div className="text-sm text-gold">Total: ৳{total.toLocaleString()}</div>
      </div>
      <div className="mt-3 overflow-x-auto rounded-sm border border-border">
        {!sales?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No offline sales yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Qty</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3 whitespace-nowrap">{new Date(s.sold_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div>{s.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[s.category, s.size, s.color].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td className="p-3">{s.quantity}</td>
                  <td className="p-3">৳{Number(s.unit_price).toLocaleString()}</td>
                  <td className="p-3 text-gold">৳{Number(s.total).toLocaleString()}</td>
                  <td className="p-3">{s.customer_name ?? "—"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => del(s.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
    </div>
  );
}
