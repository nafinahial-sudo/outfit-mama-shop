import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Product } from "@/lib/types";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  if (isLoading)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-6xl animate-pulse p-8">Loading…</div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="mx-auto max-w-md flex-1 p-12 text-center">
          <p className="font-display text-2xl">Product not found</p>
          <Link to="/" className="mt-4 inline-block text-gold">Back to shop</Link>
        </div>
        <Footer />
      </div>
    );

  const hasDiscount = product.discount_price != null && product.discount_price < product.price;
  const effective = hasDiscount ? product.discount_price! : product.price;

  const handleAdd = (buyNow: boolean) => {
    if (product.sizes.length && !size) return toast.error("Please select a size");
    if (product.colors.length && !color) return toast.error("Please select a color");
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0] ?? null,
      size,
      color,
      quantity: qty,
      price: effective,
    });
    toast.success("Added to cart");
    if (buyNow) navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Link to="/" className="text-xs text-muted-foreground hover:text-gold">← Back</Link>
        <div className="mt-4 grid gap-8 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
              {product.images[activeImg] ? (
                <img src={product.images[activeImg]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square overflow-hidden rounded-sm border ${i === activeImg ? "border-gold" : "border-border"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Info */}
          <div>
            {product.category && <div className="text-[10px] uppercase tracking-[0.3em] text-gold">{product.category}</div>}
            <h1 className="mt-2 font-display text-3xl md:text-4xl">{product.name}</h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl text-gold">৳{effective.toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
              )}
              {hasDiscount && (
                <span className="text-xs text-gold">
                  Save {Math.round(((product.price - effective) / product.price) * 100)}%
                </span>
              )}
            </div>
            {product.description && (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{product.description}</p>
            )}

            {product.sizes.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Size</div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-12 rounded-sm border px-4 py-2 text-sm transition-colors ${size === s ? "border-gold bg-gold text-background" : "border-border hover:border-gold"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Color</div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`rounded-sm border px-4 py-2 text-sm transition-colors ${color === c ? "border-gold bg-gold text-background" : "border-border hover:border-gold"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Quantity</div>
              <div className="inline-flex items-center rounded-sm border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2"><Minus className="h-3 w-3" /></button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2"><Plus className="h-3 w-3" /></button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => handleAdd(true)}
                className="flex-1 rounded-sm bg-gold py-3 text-sm font-semibold text-background hover:opacity-90"
              >
                Buy Now
              </button>
              <button
                onClick={() => handleAdd(false)}
                className="flex-1 rounded-sm border border-gold py-3 text-sm font-semibold text-gold hover:bg-gold hover:text-background transition-colors"
              >
                Add to Cart
              </button>
            </div>

            <div className="mt-6 space-y-1 text-xs text-muted-foreground">
              <p>• Cash on Delivery available</p>
              <p>• Delivery within 2–5 business days</p>
              <p>• Easy returns within 7 days</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
