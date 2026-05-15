import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [{ title: "Contact — Outfit Mama" }, { name: "description", content: "Get in touch with Outfit Mama." }] }),
});

function Contact() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Contact</div>
        <h1 className="mt-2 font-display text-4xl">Get in Touch</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Item icon={<Mail className="h-5 w-5" />} title="Email" value="outfitmamashop@gmail.com" />
          <Item icon={<Phone className="h-5 w-5" />} title="Phone" value="+880 1XXX-XXXXXX" />
          <Item icon={<MapPin className="h-5 w-5" />} title="Location" value="Dhaka, Bangladesh" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Item({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-sm border border-border p-5">
      <div className="text-gold">{icon}</div>
      <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
