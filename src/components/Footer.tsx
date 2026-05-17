import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpeg";
import { SocialBar } from "@/components/SocialBar";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Outfit Mama" className="h-10 w-10 rounded-sm object-cover" />
              <div>
                <div className="font-display text-lg">Outfit <span className="text-gold">Mama</span></div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Men's Fashion</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Modern essentials and statement pieces for the contemporary gentleman.
            </p>
            <div className="mt-5">
              <SocialBar variant="compact" />
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-gold">All Products</Link></li>
              <li><Link to="/cart" className="hover:text-gold">Cart</Link></li>
              <li><Link to="/about" className="hover:text-gold">About</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Support</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Cash on Delivery available</li>
              <li>Nationwide shipping</li>
              <li>Easy returns within 7 days</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Outfit Mama. All rights reserved.</span>
            <Link
              to="/admin/login"
              className="rounded-sm border border-gold/50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-background transition-colors"
            >
              Admin
            </Link>
          </div>
          <div>
            Developed by{" "}
            <a
              href="https://www.linkedin.com/in/sadman-nahial-nafi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline-offset-4 hover:underline"
            >
              Sadman Nahial Nafi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
