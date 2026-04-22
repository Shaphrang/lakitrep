"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminLoginSchema } from "@/lib/validators/admin-auth";

export type LoginState = {
  error?: string;
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
    return { error: parsed.error.issues[0]?.message ?? "Invalid form values." };
  }

  const supabase = await createClient();
  const { error: authError, data: authData } = await supabase.auth.signInWithPassword(parsed.data);

  if (authError || !authData.user) {
    return { error: "Invalid credentials. Please try again." };
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("is_active")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !adminProfile?.is_active) {
    await supabase.auth.signOut();
    return { error: "Your account is not authorized for admin access." };
  }

  redirect("/admin");
}
