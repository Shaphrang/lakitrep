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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,123,34,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(47,90,61,0.18),transparent_36%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,250,241,0.95),rgba(234,223,205,0.86))]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-4">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-[#dacfbf] bg-[#fffaf2]/88 shadow-[0_24px_70px_-45px_rgba(22,31,24,0.8)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left brand panel */}
          <section className="relative hidden overflow-hidden bg-[#203d2d] p-6 text-[#fff6e8] lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,123,34,0.28),transparent_34%),linear-gradient(145deg,rgba(47,90,61,0.96),rgba(21,43,31,0.98))]" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#e17b22]/14 blur-3xl" />
            <div className="absolute -right-24 top-10 h-60 w-60 rounded-full bg-white/8 blur-3xl" />

            <div className="relative z-10 flex min-h-[440px] flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f6e8d1] backdrop-blur">
                <Leaf className="h-3.5 w-3.5 text-[#e9a15c]" />
                Resort Admin
              </div>

              <h2 className="mt-6 font-serif text-4xl leading-tight tracking-tight">
                La Ki Trep
                <span className="block text-[#efc894]">
                  Management Portal
                </span>
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#eadfce]">
                Manage bookings, guests, billing, collections, cottages, and
                reports from one secure dashboard.
              </p>

              <div className="mt-7 grid gap-2.5">
                {[
                  "Booking & guest management",
                  "Billing, payments & invoices",
                  "Reports for better decisions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-3 py-2.5 text-sm text-[#f7ecdc] backdrop-blur"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e17b22] text-[11px] font-bold text-white">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-white/12 bg-white/8 p-3 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/12 text-[#efc894]">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#efc894]">
                      Secure dashboard
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#eadfce]">
                      Built for simple daily resort operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Login panel */}
          <section className="relative p-5 sm:p-7 lg:p-8">
            <div className="mx-auto flex min-h-[440px] max-w-sm flex-col justify-center">
              <div className="mb-6 text-center lg:text-left">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2f5a3d,#1f3f2f)] text-white shadow-[0_10px_24px_rgba(47,90,61,0.24)] lg:mx-0">
                  <LockKeyhole className="h-5 w-5" />
                </div>

                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#6b7d71]">
                  La Ki Trep Resort
                </p>

                <h1 className="mt-1.5 font-serif text-3xl leading-tight text-[#214531]">
                  Welcome back
                </h1>

                <p className="mt-1.5 text-sm leading-5 text-[#647267]">
                  Sign in to manage resort operations.
                </p>
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-[#e7b6b6] bg-[#fff1f1] p-2.5 text-sm leading-5 text-[#9a4040] shadow-sm">
                  {error}
                </div>
              ) : null}

              <form action={loginAdminAction} className="space-y-3.5">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-[#33533f]">
                    Email Address
                  </span>

                  <div className="group flex items-center gap-2 rounded-2xl border border-[#d8cfbf] bg-white px-3 shadow-sm transition focus-within:border-[#2f5a3d] focus-within:ring-4 focus-within:ring-[#2f5a3d]/10">
                    <Mail className="h-4 w-4 text-[#7c8a80] transition group-focus-within:text-[#2f5a3d]" />
                    <input
                      name="email"
                      className="h-11 w-full bg-transparent text-sm text-[#263d2f] outline-none placeholder:text-[#a39584]"
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
                      className="h-11 w-full bg-transparent text-sm text-[#263d2f] outline-none placeholder:text-[#a39584]"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="Enter password"
                    />
                  </div>
                </label>

                <SubmitButton
                  pendingText="Signing in..."
                  className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#e17b22_0%,#c96718_100%)] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(225,123,34,0.25)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_30px_rgba(225,123,34,0.32)]"
                >
                  Sign In
                </SubmitButton>
              </form>

              <div className="mt-5 flex flex-col gap-3 border-t border-[#e5d9c8] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#355740] transition hover:text-[#e17b22] sm:justify-start"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to site
                </Link>

                <span className="inline-flex justify-center rounded-full bg-[#edf3ee] px-3 py-1 text-[11px] font-semibold text-[#2f5a3d]">
                  Secure Access
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}