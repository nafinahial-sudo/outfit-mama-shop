import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";

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
    staleTime: 1000 * 60 * 5, // Cache products for 5 minutes
    gcTime: 1000 * 60 * 10,   // Keep unused query data in cache for 10 minutes
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex items-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-gold transition-colors duration-200 border border-border hover:border-gold/50 px-4 py-2 rounded-sm bg-muted/10 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>
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
              <div className="flex justify-center mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-gold transition-colors duration-200 border border-border hover:border-gold/50 px-4 py-2 rounded-sm bg-muted/10 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Shop
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
