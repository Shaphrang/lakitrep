import Link from "next/link";
import { loginAdminAction } from "@/actions/admin/auth";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in with your Supabase admin account.</p>
        {error ? <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
        <form action={loginAdminAction} className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Email</span>
            <input name="email" className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" required />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Password</span>
            <input name="password" className="w-full rounded-md border border-slate-300 px-3 py-2" type="password" required />
          </label>
          <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">
            Sign In
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-500">Admin users are validated against <code>public.admin_users</code>.</p>
        <Link href="/" className="mt-4 inline-block text-xs text-slate-600 underline">Back to site</Link>
      </div>
    </main>
  );
}
