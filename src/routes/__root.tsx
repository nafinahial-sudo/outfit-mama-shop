import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gold">404</h1>
        <h2 className="mt-4 font-display text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-gold px-6 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-sm bg-gold px-6 py-2.5 text-sm text-background"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Outfit Mama — Men's Fashion" },
      { name: "description", content: "Outfit Mama — premium men's fashion. Shop curated outfits with cash on delivery." },
      { name: "theme-color", content: "#000000" },
      { property: "og:title", content: "Outfit Mama — Men's Fashion" },
      { property: "og:description", content: "Outfit Mama — premium men's fashion. Shop curated outfits with cash on delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Outfit Mama — Men's Fashion" },
      { name: "twitter:description", content: "Outfit Mama — premium men's fashion. Shop curated outfits with cash on delivery." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/tGMIcjjg7xcDdWFvofZRzuxfq7N2/social-images/social-1779066298844-WhatsApp_Image_2026-05-15_at_2.55.36_PM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/tGMIcjjg7xcDdWFvofZRzuxfq7N2/social-images/social-1779066298844-WhatsApp_Image_2026-05-15_at_2.55.36_PM.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  // Ensure dark theme stays applied on client
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  // Invalidate on auth state change so admin gates re-evaluate
  useEffect(() => {
    let cleanup = () => {};
    import("@/integrations/supabase/client").then(({ supabase }) => {
      const { data } = supabase.auth.onAuthStateChange(() => {
        router.invalidate();
        queryClient.invalidateQueries();
      });
      cleanup = () => data.subscription.unsubscribe();
    });
    return () => cleanup();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
