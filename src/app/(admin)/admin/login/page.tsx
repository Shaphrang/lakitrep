import Link from "next/link";
import { ArrowLeft, Leaf, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { loginAdminAction } from "@/actions/admin/auth";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4eadc]">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,123,34,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(47,90,61,0.22),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,250,241,0.94),rgba(233,222,204,0.82))]" />

      {/* Decorative shapes */}
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#2f5a3d]/10 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-[#e17b22]/14 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-6 sm:px-5 sm:py-8">
        <div className="grid w-full overflow-hidden rounded-[1.5rem] border border-[#dacfbf] bg-[#fffaf2]/84 shadow-[0_30px_90px_-45px_rgba(22,31,24,0.75)] backdrop-blur-xl sm:rounded-[2rem] lg:grid-cols-[1.02fr_0.98fr]">
          {/* Left brand panel */}
          <section className="relative hidden min-h-[560px] overflow-hidden bg-[#203d2d] p-8 text-[#fff6e8] lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,123,34,0.32),transparent_34%),linear-gradient(145deg,rgba(47,90,61,0.96),rgba(21,43,31,0.98))]" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#e17b22]/16 blur-3xl" />
            <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-[linear-gradient(0deg,rgba(12,28,19,0.64),transparent)]" />

            <div className="relative z-10 flex h-full flex-col">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6e8d1] backdrop-blur">
                  <Leaf className="h-3.5 w-3.5 text-[#e9a15c]" />
                  Resort Admin
                </div>

                <h2 className="mt-7 font-serif text-5xl leading-tight tracking-tight">
                  La Ki Trep
                  <span className="block text-[#efc894]">
                    Management Portal
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-base leading-7 text-[#eadfce]">
                  Manage bookings, guests, billing, collections, cottages, and
                  resort operations from one secure dashboard.
                </p>
              </div>

              <div className="mt-10 grid gap-3">
                {[
                  "Booking & guest management",
                  "Billing, payments & invoices",
                  "Reports for better decisions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 p-3 text-sm text-[#f7ecdc] backdrop-blur"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e17b22] text-xs font-bold text-white shadow-sm">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <div className="rounded-3xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-[#efc894]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efc894]">
                        Secure dashboard
                      </p>
                      <p className="mt-1.5 text-sm leading-6 text-[#eadfce]">
                        Built for simple day-to-day resort operations with clear
                        staff-friendly workflows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Login panel */}
          <section className="relative p-5 sm:p-8 lg:p-10">
            <div className="mx-auto flex min-h-[520px] max-w-md flex-col justify-center sm:min-h-[560px]">
              <div className="mb-8 text-center lg:text-left">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2f5a3d,#1f3f2f)] text-white shadow-[0_12px_30px_rgba(47,90,61,0.28)] lg:mx-0">
                  <LockKeyhole className="h-6 w-6" />
                </div>

                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#6b7d71]">
                  La Ki Trep Resort
                </p>

                <h1 className="mt-2 font-serif text-4xl leading-tight text-[#214531]">
                  Welcome back
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#647267]">
                  Sign in securely to continue managing resort operations.
                </p>
              </div>

              {error ? (
                <div className="mb-5 rounded-2xl border border-[#e7b6b6] bg-[#fff1f1] p-3 text-sm leading-6 text-[#9a4040] shadow-sm">
                  {error}
                </div>
              ) : null}

              <form action={loginAdminAction} className="space-y-4">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-[#33533f]">
                    Email Address
                  </span>

                  <div className="group flex items-center gap-2 rounded-2xl border border-[#d8cfbf] bg-white px-3 shadow-sm transition focus-within:border-[#2f5a3d] focus-within:ring-4 focus-within:ring-[#2f5a3d]/10">
                    <Mail className="h-4 w-4 text-[#7c8a80] transition group-focus-within:text-[#2f5a3d]" />
                    <input
                      name="email"
                      className="h-12 w-full bg-transparent text-sm text-[#263d2f] outline-none placeholder:text-[#a39584]"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="admin@example.com"
                    />
                  </div>
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-[#33533f]">
                    Password
                  </span>

                  <div className="group flex items-center gap-2 rounded-2xl border border-[#d8cfbf] bg-white px-3 shadow-sm transition focus-within:border-[#2f5a3d] focus-within:ring-4 focus-within:ring-[#2f5a3d]/10">
                    <LockKeyhole className="h-4 w-4 text-[#7c8a80] transition group-focus-within:text-[#2f5a3d]" />
                    <input
                      name="password"
                      className="h-12 w-full bg-transparent text-sm text-[#263d2f] outline-none placeholder:text-[#a39584]"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                    />
                  </div>
                </label>

                <SubmitButton
                  pendingText="Signing in..."
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#e17b22_0%,#c96718_100%)] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(225,123,34,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_34px_rgba(225,123,34,0.36)]"
                >
                  Sign In
                </SubmitButton>
              </form>

              <div className="mt-6 flex flex-col gap-3 border-t border-[#e5d9c8] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#355740] transition hover:text-[#e17b22] sm:justify-start"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to site
                </Link>

                <span className="inline-flex justify-center rounded-full bg-[#edf3ee] px-3 py-1 text-[11px] font-semibold text-[#2f5a3d]">
                  Secure Admin Access
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}