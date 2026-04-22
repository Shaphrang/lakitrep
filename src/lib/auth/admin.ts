import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
};

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("id,email,full_name,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !admin || !admin.is_active) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.full_name,
    isActive: admin.is_active,
  };
}

export async function requireAdmin(): Promise<AuthenticatedAdmin> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
