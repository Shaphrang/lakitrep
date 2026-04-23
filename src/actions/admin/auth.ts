"use server";

import { redirect } from "next/navigation";
import { isActiveAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=Email+and+password+are+required");
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isActiveAdminUser(user.id))) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Account+is+not+authorized+for+admin");
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
