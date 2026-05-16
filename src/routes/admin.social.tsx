import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SOCIAL_KEYS } from "@/lib/constants";

export const Route = createFileRoute("/admin/social")({
  component: () => <AdminShell><Social /></AdminShell>,
});

function Social() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""])) as Record<string, string>;
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const rows = SOCIAL_KEYS.map((s) => ({ key: s.key, value: values[s.key] ?? "", updated_at: new Date().toISOString() }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      qc.invalidateQueries({ queryKey: ["public_social"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Connect</div>
      <h1 className="mt-1 font-display text-3xl">Social Media</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add your links and numbers. They appear in the storefront header, footer, and contact section.
      </p>

      <div className="mt-6 space-y-4">
        {SOCIAL_KEYS.map((s) => (
          <div key={s.key}>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{s.label}</label>
            <input
              value={values[s.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
              placeholder={s.placeholder}
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="mt-6 rounded-sm bg-gold px-8 py-3 text-sm font-semibold text-background disabled:opacity-60">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
