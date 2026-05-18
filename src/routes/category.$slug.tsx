import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Outfit Mama` },
      { name: "description", content: `Shop ${params.slug} at Outfit Mama.` },
    ],
  }),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category", slug)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Category</div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">{slug}</h1>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-muted" />
              ))}
            </div>
          ) : !products?.length ? (
            <div className="rounded-sm border border-dashed border-border p-16 text-center">
              <p className="font-display text-2xl text-gold">No products yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Check back soon for {slug}.</p>
              <Link to="/" className="mt-6 inline-block text-sm text-gold underline-offset-4 hover:underline">
                ← Back to shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {products.map((p) => {
                const hasDiscount = p.discount_price != null && p.discount_price < p.price;
                const effective = hasDiscount ? p.discount_price! : p.price;
                return (
                  <Link key={p.id} to="/products/$productId" params={{ productId: p.id }} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted/20 flex items-center justify-center border border-border/30">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} className={`max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 ${p.stock <= 0 ? "opacity-40" : "opacity-95"}`} />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                      )}
                      {p.stock <= 0 ? (
                        <div className="absolute left-2 top-2 rounded-sm bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white">STOCK OUT</div>
                      ) : hasDiscount && (
                        <div className="absolute left-2 top-2 rounded-sm bg-gold px-2 py-0.5 text-[10px] font-semibold text-background">SALE</div>
                      )}
                    </div>
                    <div className="mt-3 px-0.5">
                      <h3 className="line-clamp-1 text-sm font-medium">{p.name}</h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm text-gold">৳{effective.toLocaleString()}</span>
                        {hasDiscount && (
                          <span className="text-xs text-muted-foreground line-through">৳{p.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
