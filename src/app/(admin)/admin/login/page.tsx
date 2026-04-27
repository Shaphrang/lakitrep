import Link from "next/link";
import { loginAdminAction } from "@/actions/admin/auth";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-5 py-8">
      <div className="w-full rounded-2xl border border-[#dacfbf] bg-[linear-gradient(135deg,#fdfbf6_0%,#f3ecdf_100%)] p-6 shadow-[0_20px_40px_-34px_rgba(10,20,14,0.95)]">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#6b7d71]">La Ki Trep Resort</p>
        <h1 className="mt-2 font-serif text-3xl text-[#214531]">Admin Login</h1>
        <p className="mt-1 text-sm text-[#5a6a60]">Sign in with your Supabase admin account.</p>
        {error ? <p className="mt-3 rounded-xl border border-[#e7b6b6] bg-[#fdf0f0] p-2 text-sm text-[#9a4040]">{error}</p> : null}
        <form action={loginAdminAction} className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-[#33533f]">Email</span>
            <input name="email" className="w-full rounded-xl border border-[#d8cfbf] bg-white px-3 py-2.5" type="email" required />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#33533f]">Password</span>
            <input name="password" className="w-full rounded-xl border border-[#d8cfbf] bg-white px-3 py-2.5" type="password" required />
          </label>
          <SubmitButton pendingText="Signing in..." className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white">
            Sign In
          </SubmitButton>
        </form>
        <p className="mt-3 text-xs text-[#66776c]">Admin users are validated against <code>public.admin_users</code>.</p>
        <Link href="/" className="mt-4 inline-block text-xs font-medium text-[#355740] underline">Back to site</Link>
      </div>
    </main>
  );
}
