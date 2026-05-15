import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export const Route = createFileRoute("/admin/products/new")({ component: () => <AdminShell><NewProduct /></AdminShell> });

function NewProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", description: "", category: "",
    price: "", discount_price: "", stock: "0",
    sizes: "", colors: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...list]);
    setPreviews((prev) => [...prev, ...list.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (i: number) => {
    setFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.price || isNaN(+form.price)) return toast.error("Valid price required");
    if (files.length === 0) return toast.error("Add at least one image");

    setSubmitting(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`;
        const { error } = await supabase.storage.from("product-images").upload(path, f);
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      const { error: insErr } = await supabase.from("products").insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        price: +form.price,
        discount_price: form.discount_price ? +form.discount_price : null,
        stock: +form.stock || 0,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        images: urls,
      });
      if (insErr) throw insErr;
      toast.success("Product added");
      navigate({ to: "/admin/products" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">New</div>
      <h1 className="mt-1 font-display text-3xl">Add Product</h1>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Input label="Product Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
        <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="e.g. Shirts, Suits" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Price (৳)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
          <Input label="Discount Price (৳)" value={form.discount_price} onChange={(v) => setForm({ ...form, discount_price: v })} type="number" />
          <Input label="Stock" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} type="number" />
        </div>
        <Input label="Sizes (comma separated)" value={form.sizes} onChange={(v) => setForm({ ...form, sizes: v })} placeholder="S, M, L, XL" />
        <Input label="Colors (comma separated)" value={form.colors} onChange={(v) => setForm({ ...form, colors: v })} placeholder="Black, White, Navy" />

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Images (multiple)</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border p-6 text-sm text-muted-foreground hover:border-gold">
            <Upload className="h-4 w-4" /> Choose images
            <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-sm border border-border">
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
          {submitting ? "Saving…" : "Save Product"}
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
