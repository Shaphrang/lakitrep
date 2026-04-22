import { AdminShell } from "@/components/admin/admin-shell";
import { AdminHeader } from "@/components/admin/header";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAuthenticatedAdmin();

  return (
    <AdminShell
      topBar={<AdminHeader title="Admin" description="La Ki Trep Resort" adminName={admin.fullName} />}
    >
      {children}
    </AdminShell>
  );
}
