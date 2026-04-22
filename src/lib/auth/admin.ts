import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthenticatedAdmin = {
  userId: string;
  fullName: string | null;
};

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminProfile, error } = await supabase
    .from("admin_profiles")
    .select("id, full_name, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !adminProfile || !adminProfile.is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return {
    userId: adminProfile.id,
    fullName: adminProfile.full_name,
  };
}

export async function requireNoAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminProfile?.is_active) {
    redirect("/admin");
  }
}
