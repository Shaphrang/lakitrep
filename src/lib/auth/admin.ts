//src\lib\auth\admin.ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthenticatedAdmin = {
  userId: string;
  fullName: string | null;
  role: string;
};

type AdminProfile = {
  id: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
};

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const profileQuery = await supabase
    .from("admin_profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileQuery.error) {
    console.error("getAuthenticatedAdmin profile lookup error:", profileQuery.error);
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const adminProfile = profileQuery.data as AdminProfile | null;

  if (!adminProfile || !adminProfile.is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return {
    userId: adminProfile.id,
    fullName: adminProfile.full_name,
    role: adminProfile.role,
  };
}

export async function requireNoAdminSession() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return;
  }

  const profileQuery = await supabase
    .from("admin_profiles")
    .select("id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileQuery.error) {
    console.error("requireNoAdminSession profile lookup error:", profileQuery.error);
    return;
  }

  const adminProfile = profileQuery.data as {
    id: string;
    is_active: boolean;
  } | null;

  if (adminProfile?.is_active) {
    redirect("/admin");
  }
}