import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order-success/$orderId")({ component: Success });

function Success() {
  const { orderId } = Route.useParams();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-gold" />
        <h1 className="mt-6 font-display text-3xl">Order Placed Successfully</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you for shopping with Outfit Mama. We'll contact you shortly to confirm your order.
        </p>
        <div className="mt-6 rounded-sm border border-border px-5 py-3 text-xs">
          <span className="text-muted-foreground">Order ID:</span>{" "}
          <span className="font-mono text-gold">{orderId.slice(0, 8).toUpperCase()}</span>
        </div>
        <Link to="/" className="mt-8 rounded-sm bg-gold px-7 py-3 text-sm font-medium text-background">
          Continue Shopping
        </Link>
      </main>
      <Footer />
    </div>
  );
}
