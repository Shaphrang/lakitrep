//src\app\admin\login\actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminLoginSchema } from "@/lib/validators/admin-auth";

export type LoginState = {
  error?: string;
};

type AdminProfile = {
  id: string;
  is_active: boolean;
  role: string;
};

export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid form values.",
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    console.error("Supabase login error:", authError);
    return {
      error: authError?.message ?? "Invalid credentials. Please try again.",
    };
  }

  const profileQuery = await supabase
    .from("admin_profiles")
    .select("id, is_active, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileQuery.error) {
    console.error("Admin profile lookup error:", profileQuery.error);
    await supabase.auth.signOut();
    return { error: "Unable to verify admin access. Please try again." };
  }

  const adminProfile = profileQuery.data as AdminProfile | null;

  if (!adminProfile?.is_active) {
    await supabase.auth.signOut();
    return {
      error: "Your account is not authorized or has been deactivated. Contact super admin.",
    };
  }

  redirect("/admin");
}