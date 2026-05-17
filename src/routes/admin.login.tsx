import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminUser } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

function AdminLogin() {
  const navigate = useNavigate();
  const ensure = useServerFn(ensureAdminUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure admin record exists/has correct password before sign-in
      await ensure({});
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="" className="h-10 w-10 rounded-sm object-cover" />
          <div className="font-display text-lg">Outfit <span className="text-gold">Mama</span></div>
        </Link>
        <div className="rounded-sm border border-border p-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Admin</div>
          <h1 className="mt-1 font-display text-2xl">Sign In</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                autoComplete="off" placeholder="Enter admin email"
                className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                autoComplete="new-password" placeholder="Enter password"
                className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
            </div>
            <button disabled={loading} className="w-full rounded-sm bg-gold py-3 text-sm font-semibold text-background disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
