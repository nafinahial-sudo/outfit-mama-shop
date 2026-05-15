import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/products/")({ component: () => <AdminShell><List /></AdminShell> });

function List() {
  const { data, refetch } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Catalogue</div>
          <h1 className="mt-1 font-display text-3xl">Products</h1>
        </div>
        <Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-2.5 text-sm font-medium text-background">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-sm border border-border">
        {!data?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No products yet. Add your first product.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 overflow-hidden rounded-sm bg-muted">
                        {p.images[0] && <img src={p.images[0]} className="h-full w-full object-cover" alt="" />}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.category ?? "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gold">৳{Number(p.discount_price ?? p.price).toLocaleString()}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive">
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
