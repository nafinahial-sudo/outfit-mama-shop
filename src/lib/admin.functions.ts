import { createServerFn } from "@tanstack/react-start";
import { ADMIN_EMAIL } from "@/lib/types";

const ADMIN_PASSWORD = "OMSAFIN@2026";

async function getSupabaseAdminClient() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return supabaseAdmin;
  } catch (err) {
    if (err instanceof Error && err.message.includes("Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY")) {
      return null;
    }
    throw err;
  }
}

// Idempotently ensure the admin user exists and has the admin role.
// Called from the admin login page before signing in.
export const ensureAdminUser = createServerFn({ method: "POST" }).handler(async () => {
  const supabaseAdmin = await getSupabaseAdminClient();
  if (!supabaseAdmin) {
    return { ok: true };
  }

  // Try to find existing user
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw new Error(listErr.message);

  let userId: string | undefined = list.users.find(
    (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  )?.id;

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    userId = data.user.id;
  } else {
    // Make sure password matches the canonical admin password
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
  }

  // Ensure admin role exists
  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) throw new Error(roleErr.message);

  return { ok: true };
});
