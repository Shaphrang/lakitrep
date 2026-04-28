//src\app\(admin)\admin\layout.tsx
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";
import type { AdminRole } from "@/lib/auth/permissions";

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const admin = await getAuthenticatedAdmin();
  const adminRole: AdminRole = admin?.role ?? "staff";

  return (
    <AdminShell adminLabel={admin?.fullName ?? admin?.email ?? "Admin"} adminRole={adminRole}>
      {children}
    </AdminShell>
  );
}
