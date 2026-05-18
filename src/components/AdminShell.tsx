import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, ShoppingBag, BarChart3, LogOut, Plus, Menu, X, Store, Share2, RefreshCw } from "lucide-react";
import logo from "@/assets/logo.jpeg";

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      // Verify admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roles) {
        await supabase.auth.signOut();
        navigate({ to: "/admin/login" });
        return;
      }
      if (mounted) setAuthed(true);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (authed === null) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  const NavLink = ({ to, icon, label }: { to: string; icon: ReactNode; label: string }) => {
    const active = loc.pathname === to || (to !== "/admin" && loc.pathname.startsWith(to));
    return (
      <Link
        to={to}
        onClick={() => setNavOpen(false)}
        className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${active ? "bg-gold text-background" : "hover:bg-muted"}`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} className="h-8 w-8 rounded-sm" alt="" />
          <span className="font-display text-sm">Admin</span>
        </Link>
        <button onClick={() => setNavOpen((v) => !v)} className="rounded-sm border border-border p-2">
          {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-background p-4 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Link to="/" className="mb-8 mt-2 hidden items-center gap-2 md:flex">
            <img src={logo} className="h-9 w-9 rounded-sm" alt="" />
            <div>
              <div className="font-display text-base">Outfit <span className="text-gold">Mama</span></div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Admin Panel</div>
            </div>
          </Link>
          <nav className="space-y-1 mt-4 md:mt-0">
            <NavLink to="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
            <NavLink to="/admin/products" icon={<Package className="h-4 w-4" />} label="Products" />
            <NavLink to="/admin/products/new" icon={<Plus className="h-4 w-4" />} label="Add Product" />
            <NavLink to="/admin/orders" icon={<ShoppingBag className="h-4 w-4" />} label="Orders" />
            <NavLink to="/admin/offline-sales" icon={<Store className="h-4 w-4" />} label="Offline Sales" />
            <NavLink to="/admin/social" icon={<Share2 className="h-4 w-4" />} label="Social Media" />
            <NavLink to="/admin/reports" icon={<BarChart3 className="h-4 w-4" />} label="Reports" />
          </nav>
          <div className="mt-8 space-y-2">
            <button onClick={() => window.location.reload()} className="flex w-full items-center gap-3 rounded-sm border border-border px-3 py-2.5 text-sm hover:border-gold hover:text-gold transition-colors">
              <RefreshCw className="h-4 w-4" /> Refresh Data
            </button>
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-sm border border-border px-3 py-2.5 text-sm hover:border-destructive hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
