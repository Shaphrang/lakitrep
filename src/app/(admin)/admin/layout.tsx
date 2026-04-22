import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAuthenticatedAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader adminLabel={admin?.fullName ?? admin?.email ?? "Not signed in"} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
