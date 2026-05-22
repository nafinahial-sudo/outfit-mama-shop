import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { Trash2, Plus, Edit } from "lucide-react";
import { useState } from "react";
import { compressImage } from "@/lib/image.utils";
import { getOptimizedImageUrl } from "@/lib/image.optimizer";

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

  const toggleStock = async (id: string, currentStock: number) => {
    const newStock = currentStock > 0 ? 0 : 10;
    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(newStock === 0 ? "Product marked as out of stock" : "Product restocked (stock set to 10)");
    refetch();
  };

  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  const optimizeProduct = async (product: Product) => {
    if (optimizingId) return;
    setOptimizingId(product.id);
    toast.info(`Downloading and compressing images for "${product.name}"... This might take a few seconds.`);
    try {
      const optimizedUrls: string[] = [];
      for (const url of product.images) {
        // Fetch raw image blob
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to download image file");
        const blob = await res.blob();
        
        // Convert blob to File and compress
        const file = new File([blob], "image.jpg", { type: blob.type });
        const compressedFile = await compressImage(file);
        
        // Upload to Supabase storage bucket
        const path = `optimized-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, compressedFile);
        if (uploadError) throw uploadError;
        
        const { data: pubData } = supabase.storage.from("product-images").getPublicUrl(path);
        optimizedUrls.push(pubData.publicUrl);
      }
      
      // Update database product record
      const { error: updateError } = await supabase
        .from("products")
        .update({ images: optimizedUrls })
        .eq("id", product.id);
      
      if (updateError) throw updateError;
      toast.success(`Successfully optimized images for "${product.name}"!`);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to optimize: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setOptimizingId(null);
    }
  };

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
              {data.map((p) => {
                const hasLegacyImages = p.images?.some(url => url.includes("supabase.co") && !url.includes("optimized-"));
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-10 overflow-hidden rounded-sm bg-muted flex items-center justify-center border border-border/30">
                          {p.images[0] && <img src={getOptimizedImageUrl(p.images[0], 100)} className="max-h-full max-w-full object-contain" alt="" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{p.name}</span>
                            {p.is_featured && (
                              <span className="rounded-sm bg-gold/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gold border border-gold/20">
                                Featured
                              </span>
                            )}
                            {hasLegacyImages && (
                              <button
                                onClick={() => optimizeProduct(p)}
                                disabled={optimizingId !== null}
                                className="rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-background transition-all disabled:opacity-50"
                                title="This product has very large images that slow down the website. Click to optimize."
                              >
                                {optimizingId === p.id ? "Optimizing..." : "Optimize Size"}
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.category ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                  <td className="p-3 text-gold">৳{Number(p.discount_price ?? p.price).toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={p.stock === 0 ? "text-destructive font-medium" : ""}>
                        {p.stock === 0 ? "Out of Stock" : p.stock}
                      </span>
                      <button
                        onClick={() => toggleStock(p.id, p.stock)}
                        className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                          p.stock > 0
                            ? "border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                            : "border-gold/30 text-gold hover:bg-gold hover:text-background"
                        }`}
                      >
                        {p.stock > 0 ? "Stock Out" : "Restock"}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <Link to="/admin/products/edit/$productId" params={{ productId: p.id }} className="text-muted-foreground hover:text-gold transition-colors">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
