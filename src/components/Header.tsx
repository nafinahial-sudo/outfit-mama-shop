import logo from "@/assets/logo.jpeg";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Outfit Mama" className="h-9 w-9 rounded-sm object-cover" />
          <div className="leading-tight">
            <div className="font-display text-base tracking-wide">
              <span>Outfit </span><span className="text-gold">Mama</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Men's Fashion</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link to="/" className="hover:text-gold transition-colors">Shop</Link>
          <Link to="/about" className="hover:text-gold transition-colors">About</Link>
          <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border hover:border-gold transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-background">
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 text-sm">
            <Link to="/" onClick={() => setOpen(false)} className="py-2">Shop</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="py-2">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-2">Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
