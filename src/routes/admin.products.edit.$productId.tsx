import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, X, ArrowLeft } from "lucide-react";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/edit/$productId")({
  component: () => (
    <AdminShell>
      <EditProduct />
    </AdminShell>
  ),
});

function EditProduct() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    discount_price: "",
    stock: "0",
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [colorsList, setColorsList] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || "",
        category: product.category || "",
        price: product.price.toString(),
        discount_price: product.discount_price ? product.discount_price.toString() : "",
        stock: product.stock.toString(),
      });
      setSelectedSizes(product.sizes || []);
      setColorsList(product.colors || []);
      setIsFeatured(!!product.is_featured);
      setExistingImages(product.images || []);
    }
  }, [product]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...list]);
    setPreviews((prev) => [...prev, ...list.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (i: number) => {
    setFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = (i: number) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.price || isNaN(+form.price)) return toast.error("Valid price required");
    if (existingImages.length === 0 && files.length === 0) return toast.error("Add at least one image");

    setSubmitting(true);
    try {
      const urls: string[] = [...existingImages];
      for (const f of files) {
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`;
        const { error } = await supabase.storage.from("product-images").upload(path, f);
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }

      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        price: +form.price,
        discount_price: form.discount_price ? +form.discount_price : null,
        stock: +form.stock || 0,
        sizes: selectedSizes,
        colors: colorsList,
        images: urls,
      };

      let hasFeatured = false;
      try {
        const { error: colErr } = await supabase.from("products").select("is_featured").limit(1);
        if (!colErr) {
          payload.is_featured = isFeatured;
          hasFeatured = true;
        }
      } catch (e) {
        console.warn("is_featured column check failed:", e);
      }

      const { error: updErr } = await supabase.from("products").update(payload).eq("id", productId);
      
      if (updErr) throw updErr;
      toast.success(
        hasFeatured 
          ? "Product updated successfully" 
          : "Product updated! (Note: 'is_featured' column is missing in DB; run migrations in Supabase to enable featured status)"
      );
      navigate({ to: "/admin/products" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading product details…</div>;
  }

  if (!product) {
    return (
      <div className="p-8">
        <p className="text-destructive font-medium">Product not found</p>
        <button onClick={() => navigate({ to: "/admin/products" })} className="mt-4 text-xs text-gold flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate({ to: "/admin/products" })} className="mb-4 text-xs text-muted-foreground hover:text-gold flex items-center gap-1">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to products
      </button>
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Edit</div>
      <h1 className="mt-1 font-display text-3xl">Edit Product</h1>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Input label="Product Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none">
            <option value="">— Select Category —</option>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Price (৳)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
          <Input label="Discount Price (৳)" value={form.discount_price} onChange={(v) => setForm({ ...form, discount_price: v })} type="number" />
          <Input label="Stock" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} type="number" />
        </div>

        <div className="flex items-center gap-2 rounded-sm border border-border p-3.5 bg-muted/10">
          <input
            type="checkbox"
            id="isFeatured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-background text-gold focus:ring-gold"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-muted-foreground select-none cursor-pointer">
            Featured Product (Show in Featured Collection on Homepage)
          </label>
        </div>
        
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Sizes</label>
          <div className="flex flex-wrap gap-2">
            {["S", "M", "L", "XL", "XXL", "XXXL"].map((sz) => {
              const active = selectedSizes.includes(sz);
              return (
                <button
                  type="button"
                  key={sz}
                  onClick={() => {
                    setSelectedSizes((prev) =>
                      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
                    );
                  }}
                  className={`min-w-12 rounded-sm border px-3 py-2 text-sm transition-colors ${
                    active ? "border-gold bg-gold text-background" : "border-border hover:border-gold text-muted-foreground"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Colors</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="Type a color (e.g. Black)"
              className="flex-1 rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (colorInput.trim()) {
                    setColorsList((prev) => [...prev, colorInput.trim()]);
                    setColorInput("");
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (colorInput.trim()) {
                  setColorsList((prev) => [...prev, colorInput.trim()]);
                  setColorInput("");
                }
              }}
              className="rounded-sm border border-gold px-4 text-xs font-semibold text-gold hover:bg-gold hover:text-background transition-colors"
            >
              Add
            </button>
          </div>
          {colorsList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {colorsList.map((col, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-sm bg-muted px-2.5 py-1 text-xs text-muted-foreground border border-border"
                >
                  {col}
                  <button
                    type="button"
                    onClick={() => setColorsList((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Current Images</label>
          {existingImages.length > 0 ? (
            <div className="mb-4 grid grid-cols-4 gap-2">
              {existingImages.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(i)}
                    className="absolute right-1 top-1 rounded-sm bg-background/80 p-1 hover:bg-destructive hover:text-destructive-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-xs text-muted-foreground">No current images.</p>
          )}

          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground font-medium">Add New Images</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border p-6 text-sm text-muted-foreground hover:border-gold">
            <Upload className="h-4 w-4" /> Choose images
            <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 rounded-sm bg-background/80 p-1 hover:bg-destructive hover:text-destructive-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button disabled={submitting} className="rounded-sm bg-gold px-8 py-3 text-sm font-semibold text-background disabled:opacity-60">
          {submitting ? "Saving Changes…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
      )}
    </div>
  );
}
