import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Product } from "@/lib/types";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Minus, Plus, Loader2, ArrowLeft } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/image.optimizer";

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
    staleTime: 1000 * 60 * 5, // Cache product details for 5 minutes
    gcTime: 1000 * 60 * 10,   // Keep unused query data in cache for 10 minutes
  });

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);

  useEffect(() => {
    setMainImageLoaded(false);
  }, [activeImg]);

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
    if (product.stock <= 0) return toast.error("This product is out of stock");
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
        <div className="flex items-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-gold transition-colors duration-200 border border-border hover:border-gold/50 px-4 py-2 rounded-sm bg-muted/10 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>
        <div className="mt-4 grid gap-8 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-sm bg-muted/20 flex items-center justify-center border border-border/30">
              {product.images[activeImg] ? (
                <>
                  {!mainImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/10 animate-pulse">
                      <Loader2 className="h-8 w-8 animate-spin text-gold/50" />
                    </div>
                  )}
                  <img
                    src={getOptimizedImageUrl(product.images[activeImg], 1000)}
                    alt={product.name}
                    onLoad={() => setMainImageLoaded(true)}
                    className={`max-h-full max-w-full object-contain transition-all duration-700 ${
                      mainImageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </>
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
                    className={`aspect-square overflow-hidden rounded-sm border bg-muted/10 flex items-center justify-center ${i === activeImg ? "border-gold" : "border-border/60"}`}
                  >
                    <img src={getOptimizedImageUrl(src, 150)} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Info */}
          <div>
            {product.category && <div className="text-[10px] uppercase tracking-[0.3em] text-gold">{product.category}</div>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <h1 className="font-display text-3xl md:text-4xl">{product.name}</h1>
              {product.stock <= 0 && (
                <span className="rounded-sm bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                  Stock Out
                </span>
              )}
            </div>
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

            {product.stock > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Quantity</div>
                <div className="inline-flex items-center rounded-sm border border-border">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2"><Minus className="h-3 w-3" /></button>
                  <span className="w-10 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {product.stock > 0 ? (
                <>
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
                </>
              ) : (
                <button
                  disabled
                  className="flex-1 rounded-sm bg-muted py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed border border-border uppercase tracking-wider"
                >
                  Stock Out
                </button>
              )}
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
