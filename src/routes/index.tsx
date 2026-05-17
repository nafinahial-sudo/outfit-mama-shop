import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SocialBar } from "@/components/SocialBar";
import { Marquee } from "@/components/Marquee";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/lib/types";
import logo from "@/assets/logo.jpeg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Outfit Mama — Premium Men's Fashion" },
      { name: "description", content: "Shop curated men's outfits — shirts, suits and essentials. Cash on delivery available." },
    ],
  }),
});

function Index() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, var(--gold), transparent 40%), radial-gradient(circle at 70% 80%, var(--gold), transparent 40%)`,
        }} />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
              <span className="h-px w-8 bg-gold" /> New Season Drop
            </div>
            <h1 className="font-display text-4xl leading-tight md:text-6xl">
              Refined essentials for the <span className="gold-gradient">modern gentleman</span>.
            </h1>
            <p className="mt-5 max-w-md text-sm text-muted-foreground md:text-base">
              Tailored fits, premium fabrics, timeless silhouettes. Curated for the man who dresses with intention.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#shop" className="inline-flex items-center justify-center rounded-sm bg-gold px-7 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity">
                Shop Collection
              </a>
              <Link to="/about" className="inline-flex items-center justify-center rounded-sm border border-border px-7 py-3 text-sm hover:border-gold transition-colors">
                Our Story
              </Link>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-sm bg-black border border-border/40">
            <img src={logo} alt="Outfit Mama" className="h-full w-full object-cover opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Categories */}
      <section id="categories" className="mx-auto w-full max-w-6xl px-4 pt-14">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Shop by</div>
          <h2 className="mt-2 font-display text-3xl">Categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative block aspect-square overflow-hidden rounded-sm border border-border/60 bg-muted"
            >
              <img
                src={c.image}
                alt={c.label}
                loading="lazy"
                width={768}
                height={768}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                <div className="text-[9px] uppercase tracking-[0.25em] text-gold">Collection</div>
                <div className="font-display text-base text-white md:text-xl">{c.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="shop" className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Collection</div>
            <h2 className="mt-2 font-display text-3xl">Featured Products</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-muted" />
            ))}
          </div>
        ) : !products?.length ? (
          <div className="rounded-sm border border-dashed border-border p-16 text-center">
            <p className="font-display text-2xl text-gold">Coming Soon</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Our catalogue is being prepared. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Connect */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Stay Connected</div>
          <h2 className="mt-2 font-display text-3xl">Follow Outfit Mama</h2>
          <p className="mt-2 text-sm text-muted-foreground">New drops, behind-the-scenes and styling — first.</p>
          <div className="mt-6 flex justify-center">
            <SocialBar />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.discount_price != null && product.discount_price < product.price;
  const effective = hasDiscount ? product.discount_price! : product.price;
  return (
    <Link to="/products/$productId" params={{ productId: product.id }} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        {hasDiscount && (
          <div className="absolute left-2 top-2 rounded-sm bg-gold px-2 py-0.5 text-[10px] font-semibold text-background">
            SALE
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm text-gold">৳{effective.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
