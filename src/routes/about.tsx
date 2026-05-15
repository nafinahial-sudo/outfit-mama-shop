import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [{ title: "About — Outfit Mama" }, { name: "description", content: "About Outfit Mama — premium men's fashion." }] }),
});

function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Our Story</div>
        <h1 className="mt-2 font-display text-4xl">About <span className="gold-gradient">Outfit Mama</span></h1>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>Outfit Mama is a premium men's fashion house built on three principles — refined craftsmanship, considered fit, and timeless design.</p>
          <p>We curate every piece for the man who values quality over noise. From everyday essentials to statement looks, our collection is made to last and made to be worn with confidence.</p>
          <p>Every order is handled with care and ships nationwide with cash on delivery available.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
