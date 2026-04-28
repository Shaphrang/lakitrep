import { redirect } from "next/navigation";
import type { AdminPermission, AdminRole } from "@/lib/auth/permissions";
import { hasPermission, isAdminRole } from "@/lib/auth/permissions";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
  isActive: boolean;
};

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id,email,full_name,role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin || !admin.is_active || !isAdminRole(admin.role)) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.full_name,
    role: admin.role,
    isActive: admin.is_active,
  };
}

export async function isActiveAdminUser(userId: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function requireAdmin(): Promise<AuthenticatedAdmin> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function requireAdminPermission(permission: AdminPermission): Promise<AuthenticatedAdmin> {
  const admin = await requireAdmin();

  if (!hasPermission(admin.role, permission)) {
    redirect("/admin/access-denied");
  }

  return admin;
}
