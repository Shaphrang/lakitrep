import { logoutAdminAction } from "@/actions/admin/auth";

export function AdminHeader({ adminLabel }: { adminLabel: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <p className="text-sm text-slate-500">Admin Dashboard</p>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{adminLabel}</div>
        <form action={logoutAdminAction}>
          <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium">
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
