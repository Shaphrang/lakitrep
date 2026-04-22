import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const admin = await getAuthenticatedAdmin();
  return <AdminShell adminLabel={admin?.fullName ?? admin?.email ?? "Admin"}>{children}</AdminShell>;
}
