import { requireNoAdminSession } from "@/lib/auth/admin";
import { AdminLoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireNoAdminSession();
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
      <AdminLoginForm unauthorized={error === "unauthorized"} />
    </div>
  );
}
